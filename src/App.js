import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import AccountForm from './components/AccountForm';
import AccountList from './components/AccountList';
const API_URL = process.env.REACT_APP_API_URL;
const App = () => {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
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

  // Trigger fetching of accounts when the component mounts
  useEffect(() => {
    fetchAccounts();
  }, []);

  return (
    <div className="container">
      <h1>Account Management</h1>

      {/* Pass the form reference to the AccountForm */}
      <AccountForm
        selectedAccount={selectedAccount}
        onSave={fetchAccounts}
        ref={formRef}
      />

      {/* Pass both setAccounts and fetchAccounts to AccountList */}
      <AccountList
        accounts={accounts}
        onEdit={handleEdit}
        setAccounts={setAccounts}
        fetchAccounts={fetchAccounts}
      />
    </div>
  );
};

export default App;
