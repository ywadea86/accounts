import React, { useState, useEffect, forwardRef } from 'react';
import axios from 'axios';

const AccountForm = forwardRef(({ selectedAccount, onSave }, ref) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // New state for password
  const [isDisabled, setIsDisabled] = useState(false);
  const [hitCount, setHitCount] = useState(0);
  const [idUser, setIdUser] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); // State for error messages
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (selectedAccount) {
      setEmail(selectedAccount.email);
      setPassword(selectedAccount.password); // Clear the password field for security reasons
      setIsDisabled(selectedAccount.is_disabled);
      setHitCount(selectedAccount.hit_count);
      setIdUser(selectedAccount.id_user);
    } else {
      resetForm();
    }
  }, [selectedAccount]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(''); // Reset error message

    const accountData = {
      email,
      password: password , // Use the provided password or default
      is_disabled: isDisabled,
      hit_count: hitCount,
      id_user: idUser,
    };

    try {
      // Check if the email already exists
      const emailExists = await checkIfEmailExists(email);

      if (emailExists && (!selectedAccount || selectedAccount.email !== email)) {
        setErrorMessage('Email already exists. Please use a different email.');
        return; // Stop submission if email exists
      }

      if (selectedAccount) {
        // Update existing account
        await axios.put(`${API_URL}/accounts/${selectedAccount.id}`, accountData);
      } else {
        // Create a new account
        await axios.post(`${API_URL}/accounts`, accountData);
      }

      onSave(); // Trigger the save action and refetch accounts
      resetForm(); // Reset the form after saving
    } catch (error) {
      console.error('Error saving account:', error);
      setErrorMessage('An error occurred while saving the account.');
    }
  };

  const checkIfEmailExists = async (email) => {
    try {
      const response = await axios.get(`${API_URL}/accounts/check-email`, { params: { email } });
      return response.data.exists; // Assume the API returns { exists: true/false }
    } catch (error) {
      console.error('Error checking email existence:', error);
      return false;
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword(''); // Reset password field
    setIsDisabled(false);
    setHitCount(0);
    setIdUser('');
    setErrorMessage(''); // Reset error message
  };

  return (
    <div className="card shadow-sm mt-4" ref={ref}>
      <div className="card-body">
        <h3 className="card-title">{selectedAccount ? 'Edit Account' : 'Create Account'}</h3>
        {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
        <form onSubmit={handleSubmit} className="form-group">
          <div className="mb-3">
            <label>Email</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label>Password</label> {/* Password input field */}
            <input
              type="password"
              className="form-control"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label>User ID</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter User ID"
              value={idUser}
              onChange={(e) => setIdUser(e.target.value)}
              required
            />
          </div>
          <div className="form-check mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              checked={isDisabled}
              onChange={(e) => setIsDisabled(e.target.checked)}
            />
            <label className="form-check-label">Disabled</label>
          </div>
          <div className="mb-3">
            <label>Hit Count</label>
            <input
              type="number"
              className="form-control"
              placeholder="Enter Hit Count"
              value={hitCount}
              onChange={(e) => setHitCount(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">
            <i className="fas fa-save"></i> {selectedAccount ? 'Update' : 'Create'}
          </button>
        </form>
      </div>
    </div>
  );
});

export default AccountForm;
