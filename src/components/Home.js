import React, { useRef, useState } from "react";
import FileUploader from "./FileUploader";
import SmhCrossword from "../lib/SmhCrossword";

export default function Home() {
  //TODO - check if params provided, if so, route to crossword page

  const fileReader = useRef(null);

  const onFileRead = (e) => {
    const content = fileReader.current.result;
    let parser = new DOMParser();
    let dom = parser.parseFromString(content, "text/html");

    const smhCrossword = new SmhCrossword(dom);
    const matrix = smhCrossword.matrix;
    console.log("matrix = ", matrix);
    console.log("across = ", smhCrossword.cluesAcross);
    console.log("down = ", smhCrossword.cluesDown);

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
