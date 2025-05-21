import React, { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/write.css";

const UploadBook = () => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState("");
  const [desc, setDesc] = useState("");
  const [coverImage, setCoverImage] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);

  const handleUpload = async () => {
    if (!pdfFile || !coverImage) {
      toast.error("Please select both a book file and a cover image.");
      return;
    }

    const formData = new FormData();
    formData.append("pdf", pdfFile);
    formData.append("title", title);
    formData.append("author", author);
    formData.append("genre", genre);
    formData.append("desc", desc);
    formData.append("coverImage", coverImage);

    try {
      const token = localStorage.getItem("authToken");

await axios.post("http://localhost:1000/api/v1/upload", formData, {
  headers: {
    "Content-Type": "multipart/form-data",
    Authorization: `Bearer ${token}`,
  },
});

      toast.success("Book uploaded successfully!");
      setTitle("");
      setAuthor("");
      setGenre("");
      setDesc("");
      setCoverImage(null);
      setPdfFile(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload book.");
    }
  };

  return (
    <div className="write-container">
      <ToastContainer />
      <h1 className="write-header">Share Your Story</h1>

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

      <label className="file-label">Upload Your Book Cover</label>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setCoverImage(e.target.files[0])}
      />

      <textarea
        placeholder="Short Description"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        className="content-area"
      />

      <label className="file-label">Upload Your Book File (PDF)</label>
      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setPdfFile(e.target.files[0])}
      />

      <button className="save-button" onClick={handleUpload}>
        Upload Book
      </button>
    </div>
  );
};

export default UploadBook;
