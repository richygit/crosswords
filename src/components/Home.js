import React, { useRef, useState } from "react";
import FileUploader from "./FileUploader";
import SmhCrossword from "../lib/SmhCrossword";

export default function Home() {
  //TODO - check if params provided, if so, route to crossword page

  const fileReader = useRef(null);
  const [matrix, setMatrix] = useState(null);
  const [clues, setClues] = useState(null);

  const onFileRead = (e) => {
    const content = fileReader.current.result;
    let parser = new DOMParser();
    let dom = parser.parseFromString(content, "text/html");

    const smhCrossword = new SmhCrossword(dom);
    setMatrix(smhCrossword.matrix);
    setClues([smhCrossword.cluesAcross, smhCrossword.cluesDown]);
    // console.log("matrix = ", smhCrossword.matrix);
    // console.log("clues = ", [smhCrossword.cluesAcross, smhCrossword.cluesDown]);

    //reset fileReader since we don't need it any more
    fileReader.current = null;
  };

  const onFileChosen = (file) => {
    console.log("file chosen: ", file);

    fileReader.current = new FileReader();
    fileReader.current.onloadend = onFileRead;
    fileReader.current.readAsText(file);
  };

  // otherwise show upload area
  return <FileUploader onFileChosen={onFileChosen} onFileRead={onFileRead} />;
}
