import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ClerkProvider } from "@clerk/clerk-react";

const clerkPubKey = "pk_test_ZGVjZW50LWtvYWxhLTUzLmNsZXJrLmFjY291bnRzLmRldiQ"; // Found in Clerk dashboard

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <ClerkProvider publishableKey={clerkPubKey}>
      <App />
    </ClerkProvider>
  </React.StrictMode>
);

reportWebVitals();
