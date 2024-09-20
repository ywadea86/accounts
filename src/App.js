import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import AccountForm from './components/AccountForm';
import AccountList from './components/AccountList';
import UploadForm from './components/UploadForm';
import VisaApplication from './components/VisaApplication';
import EnableAccounts from './components/EnableAccounts';

const API_URL = process.env.REACT_APP_API_URL;

const App = () => {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [expirationTime, setExpirationTime] = useState(null); // State for token expiration time
  const [timeLeft, setTimeLeft] = useState(null); // State for countdown
  const formRef = useRef(null);

  // Fetch accounts data and set expiration time
  const fetchAccounts = async () => {
    try {
      const response = await axios.get(`${API_URL}/accounts`);
      setAccounts(response.data);

      if (response.data.length > 0) {
        const expiration = response.data[0].token_expires_at;
        const parsedExpiration = new Date(expiration); // Parse the expiration time
        if (!isNaN(parsedExpiration.getTime())) {
          setExpirationTime(parsedExpiration);
        } else {
          console.error('Invalid token expiration date format:', expiration);
        }
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
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

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [expirationTime]);

  // Format time left into minutes and seconds
  const formatTimeLeft = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds}s`;
  };

  // Scroll to the form when an account is selected for editing
  const handleEdit = (account) => {
    setSelectedAccount(account);
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth' });
    }
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
    </div>
  );
};

export default App;
