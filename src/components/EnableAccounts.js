import React, { useState } from 'react';
import axios from 'axios';

const EnableAccounts = () => {
  const [minutes, setMinutes] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const API_URL = process.env.REACT_APP_API_URL;

  const resetMessages = () => {
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleEnableAccounts = async (e) => {
    e.preventDefault();
    resetMessages();

    try {
      const response = await axios.post(`${API_URL}/enable-accounts`, { minutes });
      setSuccessMessage(response.data.message);
      setMinutes(''); // Reset the input field after successful submission
    } catch (error) {
      if (error.response) {
        setErrorMessage(`Error: ${error.response.status} - ${error.response.data.message}`);
      } else {
        setErrorMessage(`Error: ${error.message}`);
      }
    }
  };

  return (
    <div>
      <form onSubmit={handleEnableAccounts}>
        <div className="mb-3">
          <label htmlFor="minutes" className="form-label">Enter Minutes:</label>
          <input
            type="number"
            className="form-control"
            id="minutes"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-warning w-100">
          Enable Disabled Accounts
        </button>
      </form>

      {/* Success and error messages */}
      {successMessage && <div className="alert alert-success mt-3">{successMessage}</div>}
      {errorMessage && <div className="alert alert-danger mt-3">{errorMessage}</div>}
    </div>
  );
};

export default EnableAccounts;
