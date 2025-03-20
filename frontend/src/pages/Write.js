import React, { useState } from "react";
import "../styles/write.css"; // Add CSS for styling

const Write = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSave = () => {
    const data = { title, content };
    console.log("Saving:", data); // Replace with API call to save in backend
    alert("Your writing has been saved!");
  };

  return (
    <div className="write-container">
      <h1 className="write-header">Write Your Story</h1>
      <input
        type="text"
        placeholder="Title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="title-input"
      />
      <textarea
        placeholder="Start writing here..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="content-area"
      />
      <button className="save-button" onClick={handleSave}>Save</button>
    </div>
  );
};

export default Write;
