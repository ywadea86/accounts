import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import AccountForm from './components/AccountForm';
import AccountList from './components/AccountList';
import UploadForm from './components/UploadForm';
import VisaApplication from './components/VisaApplication';
import EnableAccounts from './components/EnableAccounts'; // Import Enable Accounts

const API_URL = process.env.REACT_APP_API_URL;

const App = () => {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [jsonResponse, setJsonResponse] = useState(null);
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [expirationTime, setExpirationTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null); // State for countdown
  const [confirmation, setConfirmation] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
  const formRef = useRef(null);

  // Fetch accounts data
  const fetchAccounts = async () => {
    try {
      const response = await axios.get(`${API_URL}/accounts`);
      setAccounts(response.data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  // Scroll to the form when an account is selected for editing
  const handleEdit = (account) => {
    setSelectedAccount(account);
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle the deletion of all accounts
  const handleDeleteAllAccounts = async () => {
    try {
      const response = await axios.delete(`${API_URL}/delete-all-accounts`);
      setSuccessMessage(response.data.message);
      fetchAccounts(); // Refresh the account list after deletion
    } catch (error) {
      if (error.response) {
        setErrorMessage(`Error: ${error.response.status} - ${error.response.data.message}`);
      } else {
        setErrorMessage(`Error: ${error.message}`);
      }
    }
  };

  // Step 1: Handle email submission to get token and JSON data
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get(`${API_URL}/visa-application?email=${email}`);
      setToken(response.data.token);
      setJsonResponse(response.data.visaApplicationData);
      setStep(2);  // Proceed to step 2

      // Set expiration time for the token
      const expiration = new Date(response.data.tokenExpiresAt); // Assuming the API returns tokenExpiresAt
      setExpirationTime(expiration);
    } catch (error) {
      console.error('Error fetching token and JSON:', error);
    }
  };

  // Step 2: Confirm sending OTP
  const handleConfirm = async () => {
    if (jsonResponse && jsonResponse.phoneNumber) {
      setConfirmation(true);
      try {
        await axios.post(`${API_URL}/api/send-otp`, { token });
        setStep(3);  // Proceed to OTP verification step
      } catch (error) {
        console.error('Error sending OTP:', error);
      }
    }
  };

  // Step 3: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/api/verify-otp`, {
        token,
        otp
      });
      if (response.data.message === 'OTP verified successfully') {
        setStep(4);  // Proceed to submitting the application
      } else {
        setResultMessage('OTP verification failed. Please try again.');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
    }
  };

  // Step 4: Submit Visa Application
  const handleSubmitApplication = async () => {
    try {
      const response = await axios.post(`${API_URL}/api/submit-visa`, {
        token,
        applicationData: jsonResponse,
        recaptchaToken: 'your_recaptcha_token'  // If needed
      });
      setResultMessage(`Visa application submitted successfully: ${response.data.message}`);
    } catch (error) {
      console.error('Error submitting visa application:', error);
      setResultMessage('Failed to submit visa application');
    }
  };

  // Calculate the time left for the countdown
  useEffect(() => {
    const interval = setInterval(() => {
      if (expirationTime) {
        const timeDiff = expirationTime - new Date();
        setTimeLeft(timeDiff > 0 ? timeDiff : 0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expirationTime]);

  // Format time left into minutes and seconds
  const formatTimeLeft = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds}s`;
  };

  // Trigger fetching of accounts when the component mounts
  useEffect(() => {
    fetchAccounts();
  }, []);

  return (
    <div className="container my-5">
      {/* Display the expiration date and countdown at the top */}
      <div className="row mb-4">
        <div className="col">
          <h3>Token Expiration</h3>
          {expirationTime && <p>Expiration Time: {expirationTime.toLocaleString()}</p>}
          {timeLeft !== null && (
            <p>Time Left: {timeLeft > 0 ? formatTimeLeft(timeLeft) : 'Expired'}</p>
          )}
        </div>
      </div>

      {/* Email submission and OTP steps */}
      <div className="row mb-4">
        <div className="col">
          <h1>Visa Application Portal</h1>
          {step === 1 && (
            <form onSubmit={handleEmailSubmit}>
              <label>
                Enter Email:
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>
              <button type="submit">Get Token and JSON</button>
            </form>
          )}

          {step === 2 && jsonResponse && (
            <div>
              <h3>Mobile Number: {jsonResponse.phoneNumber}</h3>
              <button onClick={handleConfirm}>Confirm and Send OTP</button>
            </div>
          )}

          {step === 3 && confirmation && (
            <form onSubmit={handleVerifyOtp}>
              <label>
                Enter OTP:
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </label>
              <button type="submit">Verify OTP</button>
            </form>
          )}

          {step === 4 && (
            <div>
              <h3>Ready to Submit Visa Application</h3>
              <button onClick={handleSubmitApplication}>Submit Application</button>
            </div>
          )}

          {resultMessage && <p>{resultMessage}</p>}
        </div>
      </div>

      <div className="row">
        {/* Left Column: Account Form, UploadForm, VisaApplication */}
        <div className="col-md-6 mb-4">
          {/* Account Form */}
          <div className="card shadow-sm border-primary mb-4">
            <div className="card-body">
              <h3 className="card-title">{selectedAccount ? 'Edit Account' : 'Create Account'}</h3>
              <AccountForm
                selectedAccount={selectedAccount}
                onSave={fetchAccounts}
                ref={formRef}
              />
            </div>
          </div>

          {/* Upload Documents */}
          <div className="card shadow-sm border-success mb-4">
            <div className="card-body">
              <h3 className="card-title">Upload Documents</h3>
              <UploadForm onUploadSuccess={fetchAccounts} />
            </div>
          </div>

          {/* Visa Application */}
          <div className="card shadow-sm border-info mb-4">
            <div className="card-body">
              <h3 className="card-title">Submit Visa Application</h3>
              <VisaApplication />
            </div>
          </div>

          {/* Enable Accounts */}
          <div className="card shadow-sm border-warning">
            <div className="card-body">
              <h3 className="card-title">Enable Accounts</h3>
              <EnableAccounts />
            </div>
          </div>

          {/* Success and Error Messages */}
          {successMessage && <div className="alert alert-success mt-3">{successMessage}</div>}
          {errorMessage && <div className="alert alert-danger mt-3">{errorMessage}</div>}
        </div>
{/* Delete All Accounts */}
<div className="mt-4">
            <button onClick={handleDeleteAllAccounts} className="btn btn-danger w-100">
              Delete All Accounts
            </button>
          </div>

          {/* Success and Error Messages */}
          {successMessage && <div className="alert alert-success mt-3">{successMessage}</div>}
          {errorMessage && <div className="alert alert-danger mt-3">{errorMessage}</div>}
        </div>
        
        {/* Right Column: Account List */}
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm border-secondary">
            <div className="card-body">
              <h3 className="card-title">Account List</h3>
              <AccountList
                accounts={accounts}
                onEdit={handleEdit}
                setAccounts={setAccounts}
                fetchAccounts={fetchAccounts}
              />
            </div>
          </div>
        
        
      </div>
    </div>
  );
};

export default App;
