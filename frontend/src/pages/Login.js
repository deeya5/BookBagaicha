import React from "react";
import { Link } from "react-router-dom"; // Import Link
import "../styles/Login.css";
import logo from "../assets/logo.png"; // Import the logo

const Login = () => {
  return (
    <div className="login-container">
      <div className="logo">
        <Link to="/">
          <img src={logo} alt="Book Bagaicha Logo" className="login-logo" />
        </Link>
      </div>
      <div className="login-form">
        <h2>Login</h2>
        <form>
          <input type="email" placeholder="Email" required />
          <input type="password" placeholder="Password" required />
          <button type="submit" className="login-button">Login</button>
        </form>
        <p className="signup-link">
          Don't have an account? <a href="/signup">Signup</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
