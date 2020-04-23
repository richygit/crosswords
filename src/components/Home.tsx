import React, { useEffect, useRef, useState } from "react";
import FileUploader from "./FileUploader";
import SmhCrossword from "../lib/SmhCrossword";
import Crossword from "./Crossword";

const Home: React.FC = () => {
  //TODO - check if params provided, if so, route to crossword page

  const fileReader = useRef<FileReader | null>(null);
  const [matrix, setMatrix] = useState<Array<Array<String | null>> | null>(
    null
  );
  const [clues, setClues] = useState<any | null>(null);

  const onFileRead = (e: any) => {
    if (fileReader.current === null) {
      return;
    }

    const content = fileReader.current.result;
    let parser = new DOMParser();
    let dom = parser.parseFromString(String(content), "text/html");

    const smhCrossword = new SmhCrossword(dom);
    setMatrix(smhCrossword.matrix);
    setClues([smhCrossword.cluesAcross, smhCrossword.cluesDown]);
    // console.log("matrix = ", smhCrossword.matrix);
    // console.log("clues = ", [smhCrossword.cluesAcross, smhCrossword.cluesDown]);

    //reset fileReader since we don't need it any more
    fileReader.current = null;
  };

  const onFileChosen = (file: any) => {
    console.log("file chosen: ", file);

    fileReader.current = new FileReader();
    fileReader.current.onloadend = onFileRead;
    fileReader.current.readAsText(file);
  };

  // otherwise show upload area
  if (!matrix && !clues) {
    return <FileUploader onFileChosen={onFileChosen} onFileRead={onFileRead} />;
  } else {
    //show crossword
    return <Crossword />;
  }
};
export default Home;
