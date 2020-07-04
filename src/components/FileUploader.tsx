import React, { useRef } from "react";
import * as R from "ramda";
import SmhCrossword from "../lib/SmhCrossword";
import { SolutionMatrix } from "./Matrix";

interface Props {
  onPageLoaded: (s: string) => void;
}

const FileUploader: React.FC<Props> = ({ onPageLoaded }) => {
  const fileReader = useRef<FileReader | null>(null);

  const onFileRead = (e: any) => {
    if (R.isNil(fileReader.current)) {
      return;
    }

    const content = fileReader.current.result;
    onPageLoaded(String(content));

    //reset fileReader since we don't need it any more
    fileReader.current = null;
  };

  const onFileChosen = (file: any) => {
    fileReader.current = new FileReader();
    fileReader.current.onloadend = onFileRead;
    fileReader.current.readAsText(file);
  };

  return (
    <>
      <h1>Upload your file.</h1>
      <input
        type="file"
        id="file-input"
        onChange={(e) =>
          onFileChosen(e.target.files ? e.target.files[0] : null)
        }
      />
    </>
  );
};

export default FileUploader;
