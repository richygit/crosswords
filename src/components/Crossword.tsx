import React, { useEffect, useState } from "react";
import { ClueGroup } from "../lib/SmhCrossword";
import * as R from "ramda";
import "./Crossword.css";

export type Matrix = Array<Array<Cell>>;

interface CrosswordProps {
  matrix: Matrix;
  cluesAcross: ClueGroup;
  cluesDown: ClueGroup;
}

export interface Cell {
  clueKey: Number | null;
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

  const withIndex = R.addIndex(R.map);

  return (
    <>
      <h1>Puzzle cds or rows transformed (9)</h1>
      <table className="crossword__matrix">
        {answers &&
          withIndex((row, y) => {
            return (
              <tr className="row" key={y}>
                {withIndex((cell, x) => {
                  return (
                    <td
                      className={`cell ${(cell as Cell).blank ? "blank" : ""}`}
                      key={x}
                      data-x={x}
                      data-y={y}
                      data-cluekey={(cell as Cell).clueKey}
                      data-blank={(cell as Cell).blank}
                    >
                      <input name={`${x}-${y}`} type="text" />
                      <span>{(cell as Cell).clueKey}</span>
                    </td>
                  );
                }, row as Array<Cell>)}
              </tr>
            );
          }, answers)}
      </table>
    </>
  );
};

export default Crossword;
