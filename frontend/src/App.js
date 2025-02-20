import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ClerkProvider, RedirectToSignIn, SignedIn, SignedOut } from "@clerk/clerk-react";
import Login from "./Login";
import CreateAccount from "./CreateAccount";

const clerkPubKey = "pk_test_ZGVjZW50LWtvYWxhLTUzLmNsZXJrLmFjY291bnRzLmRldiQ"; 

function App() {
  return (

      <Router>
        <div>
          <h1>Welcome to the Traction</h1>
          <p>Please login or create an account</p>

          <nav>
            <ul>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/create-account">Create Account</Link></li>
            </ul>
          </nav>

          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/create-account" element={<CreateAccount />} />
            <Route path="/" element={<h2>Please select an option from the menu above.</h2>} />
            <Route path="/dashboard" element={
              <SignedIn>
                <h2>Welcome to your Dashboard</h2>
              </SignedIn>
            } />
            <Route path="/protected" element={
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            } />
          </Routes>
        </div>
      </Router>
  );
}

export default App;
