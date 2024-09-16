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

  // Trigger fetching of accounts when the component mounts
  useEffect(() => {
    fetchAccounts();
  }, []);

  return (
    <div className="container my-5">
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
              <VisaApplication /> {/* Render Visa Application form */}
            </div>
          </div>

          {/* Enable Accounts */}
          <div className="card shadow-sm border-warning">
            <div className="card-body">
              <h3 className="card-title">Enable Accounts</h3>
              <EnableAccounts />
            </div>
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
    </div>
  );
};

export default App;
