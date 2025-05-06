import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/write.css"; 

const UploadBook = () => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState("");
  const [desc, setDesc] = useState("");
  const [coverImage, setCoverImage] = useState(null); // Now for file upload
  const [pdfFile, setPdfFile] = useState(null);

  const handleUpload = async () => {
    if (!pdfFile || !coverImage) return alert("Please select a PDF and a cover image.");

    const formData = new FormData();
    formData.append("pdf", pdfFile);
    formData.append("title", title);
    formData.append("author", author);
    formData.append("genre", genre); // User types the genre
    formData.append("desc", desc);
    formData.append("coverImage", coverImage); // Cover image file

    try {
      await axios.post("http://localhost:1000/api/v1/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Book uploaded successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to upload book.");
    }
  };

  return (
    <div className="write-container">
      <h1 className="write-header">Share your Story!</h1>

      <input
        type="text"
        placeholder="Book Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="title-input"
      />

      <input
        type="text"
        placeholder="Author Name"
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        className="title-input"
      />

      <input
        type="text"
        placeholder="Genre (e.g., Fiction, Fantasy)"
        value={genre}
        onChange={(e) => setGenre(e.target.value)}
        className="title-input"
      />

      {/* File input for cover image */}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setCoverImage(e.target.files[0])}
        className="title-input"
      />

      <textarea
        placeholder="Short Description"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        className="content-area"
      />

      {/* File input for PDF */}
      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setPdfFile(e.target.files[0])}
        className="title-input"
      />

      <button className="save-button" onClick={handleUpload}>
        Upload Book
      </button>
    </div>
  );
};

export default UploadBook;
