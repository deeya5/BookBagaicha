import React from "react";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import Signup from "./pages/Signup"; 
import Login from "./pages/Login";
import Explore from "./pages/Explore";
import Library from "./pages/Library"; 
import Write from "./pages/Write"; 
import Settings from "./pages/Settings";
import Admin from "./pages/Admin";
import Genre from "./pages/Genre";
import BookDetail from "./pages/BookDetail";
import SearchResults from "./components/SearchResults";

const Layout = ({ children }) => {
  const location = useLocation();

  //hiding the header component
  const showHeader = location.pathname !== "/signup" && 
  location.pathname !== "/login" && 
  location.pathname !== "/admin";


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
          <Route path="/explore" element={<Explore />} /> {/* Explore Route */}
          <Route path="/library" element={<Library />} /> {/* Library Route */}
          <Route path="/write" element={<Write />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/Admin" element={<Admin />} />
          <Route path="/Genre" element={<Genre />} />
          <Route path="/book/:id" element={<BookDetail />} />
          <Route path="/search-results" element={<SearchResults />} /> 

        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
