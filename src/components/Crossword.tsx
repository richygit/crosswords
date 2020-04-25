import React, { useEffect, useState } from "react";
import { ClueGroup } from "../lib/SmhCrossword";
import * as R from "ramda";

export type Matrix = Array<Array<Cell>>;

interface CrosswordProps {
  matrix: Matrix;
  cluesAcross: ClueGroup;
  cluesDown: ClueGroup;
}

export interface Cell {
  clueKey: Number;
  answer: String | null;
  blank: Boolean;
}

const Crossword: React.FC<CrosswordProps> = ({
  matrix: answers,
  cluesAcross,
  cluesDown,
}) => {
  const [userMatrix, setUserMatrix] = useState<Matrix | null>(null);

  useEffect(() => {
    if (R.isNil(userMatrix)) {
      // init user matrix
      const dimx = answers[0].length;
      const dimy = answers.length;
      setUserMatrix(R.range(0, dimy).map((row) => Array(dimx)));
    }
  }, [answers, userMatrix]);

  return <h1>Crossword</h1>;
};

export default Crossword;
