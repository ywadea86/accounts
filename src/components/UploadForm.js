import React, { useState } from 'react';
import axios from 'axios';

const UploadForm = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const API_URL = process.env.REACT_APP_API_URL;

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!file) {
      setErrorMessage('Please select a file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_URL}/upload-excel`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        setSuccessMessage('File uploaded and accounts created successfully.');
        onUploadSuccess(); // Trigger refetching of accounts
      } else {
        setErrorMessage('Failed to upload the file.');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setErrorMessage('An error occurred while uploading the file.');
    }
  };

  return (
    <div className="card shadow-sm mt-4">
      <div className="card-body">
        <h3 className="card-title">Upload Excel File</h3>
        {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
        {successMessage && <div className="alert alert-success">{successMessage}</div>}
        <form onSubmit={handleUpload}>
          <div className="mb-3">
            <label>Select Excel File</label>
            <input type="file" className="form-control" onChange={handleFileChange} required />
          </div>
          <button type="submit" className="btn btn-primary w-100">
            <i className="fas fa-upload"></i> Upload
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadForm;
