import React from "react";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import Signup from "./pages/Signup"; 
import Login from "./pages/Login";
import explore from "./pages/explore"

const Layout = ({ children }) => {
  const location = useLocation();

  // Hide the header 
  const showHeader = location.pathname !== "/signup" && location.pathname !== "/login";

  return (
    <>
      {showHeader && <Header />} {/* Conditionally render header */}
      {children}
    </>
  );
};

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} /> {/* Signup Route */}
          <Route path="/login" element={<Login />} /> {/* Login Route */}
          <Route path="/explore" element={<explore />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
