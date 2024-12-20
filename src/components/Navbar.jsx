import React from 'react';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="logo">BookBagaicha</div>
      <ul>
        <li>Home</li>
        <li>About</li>
        <li>Service</li>
        <li>Contact</li>
      </ul>
    </nav>
  );
};

export default Navbar;
