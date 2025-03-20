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
  });

  const navigate = useNavigate();

  const handleChange = (event) => {
    setValues({
      ...values,
      [event.target.name]: event.target.value,
    });
  };

  const submit = async () => {
    try {
      if (!values.username || !values.email || !values.password) {
        alert("All fields are required");
        return;
      }

      const response = await axios.post(
        "http://localhost:1000/api/v1/sign-up",
        values
      );
      console.log(response.data);
      navigate("/login");
    } catch (error) {
      console.error("Signup error:", error);
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to the backend Google login route
    window.location.href = "http://localhost:5000/api/auth/google";
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
