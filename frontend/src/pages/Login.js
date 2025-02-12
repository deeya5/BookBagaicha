import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import Link and useNavigate
import axios from "axios"; // Import axios for API requests
import "../styles/Login.css";
import logo from "../assets/logo.png"; // Import the logo

const Login = () => {
  const [email, setEmail] = useState(""); // State for email
  const [password, setPassword] = useState(""); // State for password
  const [error, setError] = useState(""); // State for error messages
  const navigate = useNavigate(); // For navigating after login

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent form reload

    try {
      const response = await axios.post("http://127.0.0.1:5000/api/users/login", {
        email,
        password,
      });

      if (response.status === 200) {
        alert("Login successful!");
        localStorage.setItem("token", response.data.token); // Save token in localStorage
        navigate("/"); // Redirect to homepage
      }
    } catch (error) {
      console.error("Error during login:", error);
      setError(error.response?.data?.message || "Invalid login credentials");
    }
  };

  return (
    <div className="login-container">
      <div className="logo">
        <Link to="/">
          <img src={logo} alt="Book Bagaicha Logo" className="login-logo" />
        </Link>
      </div>
      <div className="login-form">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="login-button">Login</button>
          {error && <p className="error-message">{error}</p>}
        </form>
        <p className="signup-link">
          Don't have an account? <a href="/signup">Signup</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
