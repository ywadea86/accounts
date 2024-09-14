import React, { useState, useEffect } from 'react';
import axios from 'axios';

const VisaApplication = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [token, setToken] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [applicationData, setApplicationData] = useState(null);
  const [captcha, setCaptcha] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [reservationLink, setReservationLink] = useState('');
  const [sessionId, setSessionId] = useState('');

  const apiUrl = process.env.REACT_APP_API_URL; // Use the environment variable for API URL

  const resetMessages = () => {
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleApiError = (error) => {
    if (error.response) {
      setErrorMessage(`Error: ${error.response.status} - ${error.response.data.message}`);
    } else {
      setErrorMessage(`Error: ${error.message}`);
    }
  };

  const startOtpCountdown = () => {
    setCountdown(120); // 2 minutes
  };

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    } else if (countdown === 0 && otpSent) {
      setOtpSent(false);
      setSuccessMessage(''); // Clear the success message when OTP expires
      setErrorMessage('OTP expired. Please request a new OTP.');
    }
    return () => clearInterval(timer);
  }, [countdown, otpSent]);

  const getToken = async () => {
    resetMessages();
    try {
      const response = await axios.get(`${apiUrl}/visa-application`, {
        params: { email },
      });
      setToken(response.data.token);
      setApplicationData(response.data.visaApplicationData);
      setSuccessMessage('Token received. You can now request OTP.');
    } catch (error) {
      handleApiError(error);
    }
  };

  const sendOtp = async () => {
    resetMessages();
    try {
      await axios.post(`${apiUrl}/api/send-otp`, { token });
      setOtpSent(true);
      startOtpCountdown();
      setSuccessMessage('OTP sent. Please check your mobile.');
    } catch (error) {
      handleApiError(error);
    }
  };

  const verifyOtpToken = async () => {
    resetMessages();
    try {
      const response = await axios.post(`${apiUrl}/api/verify-otp`, { token, otp });
      if (response.data.message === true) {
        setOtpVerified(true);
        setSuccessMessage('OTP verified successfully.');

        // Stop OTP countdown after successful verification
        setCountdown(0);
        setOtpSent(false); // Stop the countdown to prevent OTP expiration message

        // Call updateOtp after OTP verification
        await updateOtp(email, otp);

        // Fetch the application data after updating the OTP
        const appDataResponse = await appData(email);
        setApplicationData(appDataResponse);
      } else {
        setErrorMessage('OTP verification failed.');
      }
    } catch (error) {
      handleApiError(error);
    }
  };

  // Function to update OTP in the backend
  const updateOtp = async (email, otp) => {
    const requestData = {
      email: email, // The email associated with the visa application
      otp: otp, // The new OTP you want to update
    };

    try {
      const response = await axios.put(`${apiUrl}/visa-application/otp`, requestData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Response:', response.data);
    } catch (error) {
      handleApiError(error);
    }
  };

  // Function to fetch application data
  const appData = async (email) => {
    try {
      const response = await axios.get(`${apiUrl}/visa-application`, {
        params: { email },
      });

      console.log('applicationData:', response.data.visaApplicationData);
      return response.data.visaApplicationData;
    } catch (error) {
      handleApiError(error);
    }
  };

  const getCaptcha = async () => {
    try {
      const response = await axios.get(`${apiUrl}/captcha`);
      return response.data.value;
    } catch (error) {
      handleApiError(error);
    }
  };

  const submitApplication = async () => {
    resetMessages();
    try {
      // Get captcha token
      const captchaToken = await getCaptcha();

      // Ensure application data is fetched before submission
      if (!applicationData) {
        const appDataResponse = await appData(email);
        setApplicationData(appDataResponse);
      }

      // Submit visa application
      const response = await axios.post(`${apiUrl}/api/submit-visa`, {
        token: token,
        applicationData: applicationData,
        recaptchaToken: captchaToken,
      });

      setSessionId(response.data.sessionId);  // Store the sessionId for the payment link
      setReservationLink(response.data.reservationLink);
      setSuccessMessage('Visa application submitted successfully.');
    } catch (error) {
      handleApiError(error);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Visa Application</h2>

      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      {/* Step 1: Email input to get token */}
      {!otpSent && !otpVerified && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            getToken();
          }}
        >
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email:
            </label>
            <input
              type="email"
              className="form-control"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">
            Submit Email
          </button>
        </form>
      )}

      {/* Step 2: Button to send OTP */}
      {token && !otpSent && !otpVerified && (
        <div className="mt-4">
          <button onClick={sendOtp} className="btn btn-info w-100">
            Ready to Receive OTP
          </button>
        </div>
      )}

      {/* Step 3: OTP input field with countdown */}
      {otpSent && !otpVerified && (
        <div className="mt-4">
          <div className="mb-3">
            <label htmlFor="otp" className="form-label">
              OTP (Expires in {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}):
            </label>
            <input
              type="text"
              className="form-control"
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>
          <button onClick={verifyOtpToken} className="btn btn-primary w-100">
            Verify OTP
          </button>
        </div>
      )}

      {/* Step 4: Submit visa application */}
      {otpVerified && (
        <div className="mt-4">
          <button onClick={submitApplication} className="btn btn-success w-100">
            Submit Visa Application
          </button>
        </div>
      )}

      {/* Reservation Link */}
      {reservationLink && (
        <div className="mt-4">
          <p>
            Your reservation link:{' '}
            <a href={reservationLink} target="_blank" rel="noopener noreferrer">
              {reservationLink}
            </a>
          </p>
        </div>
      )}

      {/* Print the Mastercard payment link */}
      {sessionId && (
        <div className="mt-4">
          <p>
            Pay via Mastercard:{' '}
            <a
              href={`https://eu.gateway.mastercard.com/checkout/pay/${sessionId}?checkoutVersion=1.0.0`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Click here to pay
            </a>
          </p>
        </div>
      )}
    </div>
  );
};

export default VisaApplication;
