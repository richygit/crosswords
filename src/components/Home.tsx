import React, { useEffect, useRef, useState } from "react";
import FileUploader from "./FileUploader";
import SmhCrossword, { ClueGroupData } from "../lib/SmhCrossword";
import Crossword from "./Crossword";
import * as R from "ramda";
import { SolutionMatrix } from "./Matrix";

const Home: React.FC = () => {
  //TODO - check if params provided, if so, route to crossword page

  const fileReader = useRef<FileReader | null>(null);
  const [matrix, setMatrix] = useState<SolutionMatrix | null>(null);
  const [cluesAcross, setCluesAcross] = useState<ClueGroupData | null>(null);
  const [cluesDown, setCluesDown] = useState<ClueGroupData | null>(null);

  const onFileRead = (e: any) => {
    if (R.isNil(fileReader.current)) {
      return;
    }

    const content = fileReader.current.result;
    let parser = new DOMParser();
    let dom = parser.parseFromString(String(content), "text/html");

    const smhCrossword = new SmhCrossword(dom);
    setMatrix(smhCrossword.matrix);
    setCluesAcross(smhCrossword.cluesAcross);
    setCluesDown(smhCrossword.cluesDown);
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
  if (!R.isNil(matrix) && !R.isNil(cluesAcross) && !R.isNil(cluesDown)) {
    return (
      <Crossword
        matrix={matrix}
        cluesAcross={cluesAcross}
        cluesDown={cluesDown}
      />
    );
  } else {
    return <FileUploader onFileChosen={onFileChosen} onFileRead={onFileRead} />;
  }
};
export default Home;
