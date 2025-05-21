import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/AuthSuccess.css"; // Create this CSS file for styling

const AuthSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Extract query parameters
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const username = params.get("username");
    const avatar = params.get("avatar");
    
    if (token) {
      // Store authentication data in localStorage
      localStorage.setItem("authToken", token);
      localStorage.setItem("username", username || "");
      localStorage.setItem("avatar", avatar || "");
      
      // Trigger a storage event so other components know the auth state changed
      window.dispatchEvent(new Event("storage"));
      
      // Redirect to home page after a brief delay
      const timer = setTimeout(() => {
        navigate("/");
      }, 2000);
      
      return () => clearTimeout(timer);
    } else {
      // If no token received, redirect to login with error
      navigate("/login?error=authentication_failed");
    }
  }, [navigate, location]);
  
  return (
    <div className="auth-success-container">
      <div className="auth-success-card">
        <div className="success-icon">✓</div>
        <h2>Authentication Successful!</h2>
        <p>You have successfully signed in with Google.</p>
        <p>Redirecting to homepage...</p>
      </div>
    </div>
  );
};

export default AuthSuccess;