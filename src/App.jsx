import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import PopularReads from './components/PopularReads';
import './App.css';

function App() {
  return (
    <>
      <Navbar />
      <Hero />
      <PopularReads />
    </>
  );
}

export default App;
