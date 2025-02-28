// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';

// const MFASetupForm = () => {
//   const [loading, setLoading] = useState(true);
//   const [qrCode, setQrCode] = useState('');
//   const [secretKey, setSecretKey] = useState('');
//   const [token, setToken] = useState('');
//   const [error, setError] = useState('');
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchMFASetupData();
//   }, []);

//   const fetchMFASetupData = async () => {
//     try {
//       const csrfToken = document.cookie
//         .split('; ')
//         .find(row => row.startsWith('csrftoken='))
//         ?.split('=')[1];
  
//       const token = localStorage.getItem('access_token');

//       console.log("Access Token:", token);  // Debugging line
//       console.log("CSRF Token", csrfToken)
//       console.log("Cookies:", document.cookie);
  
//       const response = await axios.get('http://localhost:8000/api/users/mfa-setup/', {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'X-CSRFToken': csrfToken,
//         },
//       });
  
//       setQrCode(response.data.qr_code);
//       setSecretKey(response.data.secret_key);
//       setLoading(false);
//     } catch (err) {
//       setError('Failed to load MFA setup. Please try again later.');
//       setLoading(false);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');

//     try {
//       // Get CSRF token from cookies
//       const csrfToken = document.cookie
//         .split('; ')
//         .find(row => row.startsWith('csrftoken='))
//         ?.split('=')[1];

//       const response = await axios.post('http://localhost:8000/api/users/mfa-setup/', { token }, {
//         headers: {
//           'X-CSRFToken': csrfToken,
//         },
//       });

//       // Redirect based on user role
//       redirectBasedOnRole(response.data.role);
//     } catch (err) {
//       setError(err.response?.data?.message || 'Invalid verification code.');
//     }
//   };

//   const redirectBasedOnRole = (role) => {
//     switch (role) {
//       case 'athlete':
//         navigate('/athlete-dashboard');
//         break;
//       case 'trainer':
//         navigate('/trainer-dashboard');
//         break;
//       case 'coach':
//         navigate('/coach-dashboard');
//         break;
//       default:
//         navigate('/');
//     }
//   };

//   if (loading) {
//     return <div className="auth-container">Loading MFA setup...</div>;
//   }

//   return (
//     <div className="auth-container">
//       <h2>Set Up Multi-Factor Authentication</h2>
      
//       {error && <div className="error-message">{error}</div>}
      
//       <div className="mfa-instructions">
//         <p>Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.):</p>
        
//         <div className="qr-code-container">
//           <img src={`data:image/svg+xml;base64,${qrCode}`} alt="QR Code" />
//         </div>
        
//         <p>Or manually enter this key in your authenticator app:</p>
//         <div className="secret-key">{secretKey}</div>
//       </div>
      
//       <form onSubmit={handleSubmit}>
//         <div className="form-group">
//           <label htmlFor="token">Enter the 6-digit code from your authenticator app:</label>
//           <input
//             type="text"
//             id="token"
//             name="token"
//             value={token}
//             onChange={(e) => setToken(e.target.value)}
//             placeholder="Enter 6-digit code"
//             maxLength="6"
//             required
//           />
//         </div>
        
//         <button type="submit" className="btn btn-primary">Verify</button>
//       </form>
//     </div>
//   );
// };

// export default MFASetupForm;

import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth'; // Adjust the path as needed

const MFASetupForm = () => {
  const { accessToken, user } = useAuth(); // Get access token from context
  const [loading, setLoading] = useState(true);
  const [qrCode, setQrCode] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  console.log('MFASetupForm:', { accessToken, user });

  useEffect(() => {
    if (accessToken) {
      fetchMFASetupData();
    } else {
      setError('Not authenticated. Please log in again.');
      setLoading(false);
    }
  }, [accessToken]);


  const fetchMFASetupData = async () => {
    try {
      const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];

      console.log("Access Token:", accessToken);  // Debugging line

      const response = await axios.get('http://localhost:8000/api/users/mfa-setup/', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-CSRFToken': csrfToken,
        },
      });

      setQrCode(response.data.qr_code);
      setSecretKey(response.data.secret_key);
      setLoading(false);
    } catch (err) {
      setError('Failed to load MFA setup. Please try again later.');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Get CSRF token from cookies
      const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];

      const response = await axios.post('http://localhost:8000/api/users/mfa-setup/', { token }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`, // Include the access token
          'X-CSRFToken': csrfToken,
        },
      });

      // Redirect based on user role
      redirectBasedOnRole(response.data.role);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid verification code.');
    }
  };

  const redirectBasedOnRole = (role) => {
    switch (role) {
      case 'athlete':
        navigate('/athlete-dashboard');
        break;
      case 'trainer':
        navigate('/trainer-dashboard');
        break;
      case 'coach':
        navigate('/coach-dashboard');
        break;
      default:
        navigate('/');
    }
  };

  if (loading) {
    return <div className="auth-container">Loading MFA setup...</div>;
  }

  return (
    <div className="auth-container">
      <h2>Set Up Multi-Factor Authentication</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="mfa-instructions">
        <p>Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.):</p>
        
        <div className="qr-code-container">
          <img src={`data:image/svg+xml;base64,${qrCode}`} alt="QR Code" />
        </div>
        
        <p>Or manually enter this key in your authenticator app:</p>
        <div className="secret-key">{secretKey}</div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="token">Enter the 6-digit code from your authenticator app:</label>
          <input
            type="text"
            id="token"
            name="token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Enter 6-digit code"
            maxLength="6"
            required
          />
        </div>
        
        <button type="submit" className="btn btn-primary">Verify</button>
      </form>
    </div>
  );
};

export default MFASetupForm;
