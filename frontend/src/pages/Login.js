import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Login.css";
import logo from "../assets/logo.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:1000/api/v1/sign-in",
        { email, password }
      );

      if (response.status === 200) {
        // Store the token in localStorage
        // After successful login, store username in localStorage
        localStorage.setItem("username", response.data.username);
        localStorage.setItem("authToken", response.data.token);
        window.dispatchEvent(new Event("storage")); // Force UI update


        // Optionally set the username to the state if needed (could also directly use localStorage in Header.js)
        // setUserName(response.data.username);

        navigate("/"); // Redirects to homepage or any page you prefer
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
          Don't have an account? <Link to="/signup">Signup</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
