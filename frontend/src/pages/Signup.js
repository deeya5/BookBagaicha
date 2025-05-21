import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Signup.css";
import logo from "../assets/logo.png";

const Signup = () => {
  const [values, setValues] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user", // Default role
  });

  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (event) => {
    setValues({
      ...values,
      [event.target.name]: event.target.value,
    });
  };

  const submit = async () => {
    setError(null);

    if (!values.username || !values.email || !values.password || !values.confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (values.password !== values.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    const { confirmPassword, ...requestData } = { ...values };

    try {
      console.log("Sending signup request with data:", { ...requestData, password: "[REDACTED]" });
      const response = await axios.post("http://localhost:1000/api/v1/sign-up", requestData);
      
      console.log("Signup response received:", { 
        ...response.data, 
        token: response.data.token ? "[TOKEN RECEIVED]" : "[NO TOKEN]" 
      });
      
      // Extract authentication data
      const { id, username, role, token } = response.data;
      
      if (!token) {
        console.error("No authentication token received from server");
        setError("Account created but no authentication token received. Please try logging in.");
        navigate("/login");
        return;
      }
      
      // Create user object
      const user = { _id: id, username, role };
      
      // Store auth data in localStorage
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("username", username);
      localStorage.setItem("authToken", token);
      localStorage.setItem("userRole", role);
      
      // Force UI update
      window.dispatchEvent(new Event("storage"));
      
      console.log("Authentication data stored successfully");
      
      // Redirect based on role
      if (role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Signup error:", error);
      console.error("Error response:", error.response?.data);
      setError(error.response?.data?.message || "Signup failed. Please try again.");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:1000/api/auth/google";
  };

  return (
    <div className="signup-container">
      <div className="logo">
        <Link to="/">
          <img src={logo} alt="Book Bagaicha Logo" className="signup-logo" />
        </Link>
      </div>
      <div className="signup-form">
        <h2>Signup</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={(e) => { e.preventDefault(); submit(); }}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            required
            value={values.username}
            onChange={handleChange}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            value={values.email}
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            value={values.password}
            onChange={handleChange}
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            required
            value={values.confirmPassword}
            onChange={handleChange}
          />
          <select name="role" value={values.role} onChange={handleChange} required>
            <option value="user">User</option>
            <option value="author">Author</option>
          </select>
          <button type="submit" className="signup-button">
            Signup
          </button>
        </form>
        <div className="google-login">
          <p>OR</p>
          <button className="google-button" onClick={handleGoogleLogin}>
            <img
              src="https://developers.google.com/identity/images/g-logo.png"
              alt="Google Icon"
            />
            Continue with Google
          </button>
        </div>
        <p className="login-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;