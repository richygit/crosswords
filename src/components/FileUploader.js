import React from "react";

export default function FileUploader() {
  let fileReader;

  const onFileRead = (e) => {
    const content = fileReader.result;
    console.log("content: ", content);
  };

  const onFileChosen = (file) => {
    console.log("file chosen: ", file);
    fileReader = new FileReader();
    fileReader.onloadend = onFileRead;
    fileReader.readAsText(file);
  };

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
