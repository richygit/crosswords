import React, { useEffect, useState } from "react";
import { ClueGroup } from "../lib/SmhCrossword";
import * as R from "ramda";
import "./Crossword.scss";
import TableCell from "./TableCell";

export type Matrix = Array<Array<Cell>>;

interface CrosswordProps {
  matrix: Matrix;
  cluesAcross: ClueGroup;
  cluesDown: ClueGroup;
}

export interface Cell {
  clueKey: number | null; // the number to display
  answer: string | null;
  isBlank: boolean;
  isStart: boolean;
  xClueNo: number | null;
  yClueNo: number | null;
}

interface Coords {
  x: number;
  y: number;
}

const Crossword: React.FC<CrosswordProps> = ({
  matrix: solution,
  cluesAcross,
  cluesDown,
}) => {
  const [answers, setAnswers] = useState<Matrix | null>(null);
  const [cursor, setCursor] = useState<Coords | null>(null);

  useEffect(() => {
    if (R.isNil(answers)) {
      // init user matrix
      const dimx = solution[0].length;
      const dimy = solution.length;
      setAnswers(R.range(0, dimy).map((row) => Array(dimx)));
    }
  }, [solution, answers]);

  const withIndex = R.addIndex(R.map);

  const onCellClick = (e: React.MouseEvent): void => {
    e.preventDefault();
    let elem: Element = e.target as Element;
    console.log("elem:", elem);
    console.log("elem parent:", elem.parentElement);
    if (elem && elem.nodeName !== "TD") {
      elem = elem.parentElement as Element;
    }
    const coords = elem.id.split(".");

    console.log("coords: ", coords);

    if (coords) {
      const x = Number.parseInt(coords[0]);
      const y = Number.parseInt(coords[1]);
      setCursor({ x, y } as Coords);
    }
  };

  return (
    <div style={{ margin: "0 auto" }}>
      <h1>Puzzle cds or rows transformed (9)</h1>
      <table className="crossword__matrix">
        <tbody>
          {solution &&
            withIndex((row, y) => {
              return (
                <tr className="row" key={y}>
                  {withIndex((cell, x) => {
                    return (
                      <TableCell
                        key={`${x}.${y}`}
                        x={x}
                        y={y}
                        clueKey={(cell as Cell).clueKey}
                        isBlank={(cell as Cell).isBlank}
                        isSelected={
                          !!cursor && cursor.x === x && cursor.y === y
                        }
                        onClick={onCellClick}
                      />
                    );
                  }, row as Array<Cell>)}
                </tr>
              );
            }, solution)}
        </tbody>
      </table>
    </div>
  );
};

export default Crossword;
