// src/utils/csrf.js
import axios from 'axios';

// Function to get CSRF token from cookies
export const getCSRFToken = () => {
  return document.cookie
    .split('; ')
    .find(row => row.startsWith('csrftoken='))
    ?.split('=')[1];
};

// Set up axios to include CSRF token in all requests
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';