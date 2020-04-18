import React from "react";

export default function FileUploader({ onFileRead, onFileChosen }) {
  return (
    <>
      <h1>Upload your file.</h1>
      <input
        type="file"
        id="file-input"
        onChange={(e) => onFileChosen(e.target.files[0])}
      />
    </>
  );
}
