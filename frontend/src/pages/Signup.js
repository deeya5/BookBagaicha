import React from "react";
import { Link } from "react-router-dom"; // Import Link
import "../styles/Signup.css";
import logo from "../assets/logo.png"; // Import the logo
const API_URL = "http://127.0.0.1:5000/api/users/signup";

const Signup = () => {
  return (
    <div className="signup-container">
      <div className="logo">
        <Link to="/">
          <img src={logo} alt="Book Bagaicha Logo" className="signup-logo" />
        </Link>
      </div>
      <div className="signup-form">
        <h2>Signup</h2>
        <form>
          <input type="email" placeholder="Email" required />
          <input type="text" placeholder="Username" required />
          <input type="password" placeholder="Password" required />
          <input type="password" placeholder="Confirm Password" required />
          <button type="submit" className="signup-button">Signup</button>
        </form>
        <div className="google-login">
          <p>OR</p>
          <button className="google-button">
            <img
              src="https://developers.google.com/identity/images/g-logo.png"
              alt="Google Icon"
            />
            Continue with Google
          </button>
        </div>
        <p className="login-link">
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
