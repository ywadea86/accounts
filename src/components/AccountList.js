import React, { useEffect } from 'react';
import axios from 'axios';
const API_URL = process.env.REACT_APP_API_URL;
const AccountList = ({ accounts, onEdit, setAccounts }) => {
  
  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/accounts/${id}`);
      console.log('Delete response:', response.status);

      if (response.status === 204 || response.status === 200) {
        // Remove the deleted account from the state
        setAccounts((prevAccounts) => prevAccounts.filter((account) => account.id !== id));
      } else {
        console.error('Failed to delete account');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  useEffect(() => {
    console.log('Accounts have been updated:', accounts);
  }, [accounts]);

  // Calculate the totals
  const totalAccounts = accounts.length;
  const disabledAccounts = accounts.filter((account) => account.is_disabled).length;
  const enabledAccounts = totalAccounts - disabledAccounts;

  return (
    <div className="card shadow-sm mt-4">
      <div className="card-body">
        <h3 className="card-title">Accounts</h3>
        
        {/* Displaying account statistics */}
        <div className="mb-3">
          <strong>Total Accounts: {totalAccounts}</strong> <br />
          <strong>Disabled Accounts: {disabledAccounts}</strong> <br />
          <strong>Enabled Accounts: {enabledAccounts}</strong>
        </div>

        {/* Sorting accounts based on last_hit_at in descending order */}
        <ul className="list-group">
          {accounts
            .sort((a, b) => new Date(b.last_hit_at) - new Date(a.last_hit_at))
            .map((account) => (
              <li
                key={account.id}
                className={`list-group-item d-flex justify-content-between align-items-center ${
                  account.is_disabled ? 'text-danger font-weight-bold' : ''
                }`}
              >
                <div>
                  <strong>{account.email}</strong>
                  <p className="mb-0">
                    <small>
                      User ID: {account.id_user} | Disabled: {account.is_disabled ? 'Yes' : 'No'} | Hit Count: {account.hit_count}
                    </small>
                  </p>
                  <p className="mb-0">
                    <small>
                      Last Hit At: {account.last_hit_at ? new Date(account.last_hit_at).toLocaleString() : 'N/A'}
                    </small>
                  </p>
                </div>
                <div>
                  <button className="btn btn-sm btn-success me-2" onClick={() => onEdit(account)}>
                    <i className="fas fa-edit"></i> Edit
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(account.id)}>
                    <i className="fas fa-trash-alt"></i> Delete
                  </button>
                </div>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};

export default AccountList;
