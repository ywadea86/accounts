import React, { useState, useEffect, forwardRef } from 'react';
import axios from 'axios';

const AccountForm = forwardRef(({ selectedAccount, onSave }, ref) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isDisabled, setIsDisabled] = useState(false);
  const [hitCount, setHitCount] = useState(0);
  const [idUser, setIdUser] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); // New state for success message
  const [deleteIdUser, setDeleteIdUser] = useState(''); // State for delete input
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (selectedAccount) {
      setEmail(selectedAccount.email);
      setPassword(selectedAccount.password); // Clear password for security
      setIsDisabled(selectedAccount.is_disabled);
      setHitCount(selectedAccount.hit_count);
      setIdUser(selectedAccount.id_user);
    } else {
      resetForm();
    }
  }, [selectedAccount]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const accountData = {
      email,
      password: password,
      is_disabled: isDisabled,
      hit_count: hitCount,
      id_user: idUser,
    };

    try {
      const emailExists = await checkIfEmailExists(email);
      if (emailExists && (!selectedAccount || selectedAccount.email !== email)) {
        setErrorMessage('Email already exists. Please use a different email.');
        return;
      }

      if (selectedAccount) {
        await axios.put(`${API_URL}/accounts/${selectedAccount.id}`, accountData);
        setSuccessMessage('Account updated successfully.');
      } else {
        await axios.post(`${API_URL}/accounts`, accountData);
        setSuccessMessage('Account created successfully.');
      }

      onSave();
      resetForm();
    } catch (error) {
      console.error('Error saving account:', error);
      setErrorMessage('An error occurred while saving the account.');
    }
  };

  const checkIfEmailExists = async (email) => {
    try {
      const response = await axios.get(`${API_URL}/accounts/check-email`, { params: { email } });
      return response.data.exists;
    } catch (error) {
      console.error('Error checking email existence:', error);
      return false;
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // Call the API to delete all tokens for the specified id_user
      await axios.delete(`${API_URL}/tokens/${deleteIdUser}`);
      setDeleteIdUser(''); // Clear the delete input field after success
      setSuccessMessage('User tokens deleted successfully.');
      onSave(); // Trigger save or refresh action to update the account list
    } catch (error) {
      console.error('Error deleting tokens:', error);
      setErrorMessage(`An error occurred while deleting the tokens. ${error.message}`);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setIsDisabled(false);
    setHitCount(0);
    setIdUser('');
    setErrorMessage('');
    setSuccessMessage('');
  };

  return (
    <div className="card shadow-sm mt-4" ref={ref}>
      <div className="card-body">
        <h3 className="card-title">{selectedAccount ? 'Edit Account' : 'Create Account'}</h3>
        {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
        {successMessage && <div className="alert alert-success">{successMessage}</div>}
        
        {/* Form for creating/updating an account */}
        <form onSubmit={handleSubmit} className="form-group">
          <div className="mb-3">
            <label>Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label>Password</label>
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

        {/* Form for deleting an account by id_user */}
        <div className="mt-4">
          <h4>Delete Account by User ID</h4>
          {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
          {successMessage && <div className="alert alert-success">{successMessage}</div>}
          <form onSubmit={handleDelete} className="form-group">
            <div className="mb-3">
              <label>Delete User ID</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter User ID to Delete"
                value={deleteIdUser}
                onChange={(e) => setDeleteIdUser(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-danger w-100">
              <i className="fas fa-trash"></i> Delete User
            </button>
          </form>
        </div>
      </div>
    </div>
  );
});

export default AccountForm;
