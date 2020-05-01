import React, { useEffect, useState } from "react";
import { ClueGroup } from "../lib/SmhCrossword";
import * as R from "ramda";
import "./Crossword.scss";
import TableCell from "./TableCell";
import { AnswerMatrix, Coords, SolutionMatrix } from "./Matrix";

interface CrosswordProps {
  matrix: SolutionMatrix;
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

const Crossword: React.FC<CrosswordProps> = ({
  matrix: solution,
  cluesAcross,
  cluesDown,
}) => {
  const [answers, setAnswers] = useState<AnswerMatrix | null>(null);
  const [cursor, setCursor] = useState<Coords | null>(null);
  const [xClueNoSelected, setXClueNoSelected] = useState<number | null>(null);
  const [yClueNoSelected, setYClueNoSelected] = useState<number | null>(null);

  useEffect(() => {
    if (R.isNil(answers)) {
      // init user matrix
      setAnswers(new AnswerMatrix(solution));
    }
  }, [solution, answers]);

  useEffect(() => {
    //if the cursor changes, update the selected clueNo
    if (R.isNil(cursor)) {
      //reset the selected clueNos
      setXClueNoSelected(null);
      setYClueNoSelected(null);
      return;
    }

    //cursor is selected, check if we can set the selected clueNos
    const selectedCell = solution.getCell(cursor);
  }, [cursor]);

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
            R.map((y) => {
              return (
                <tr className="row" key={y}>
                  {R.map((x) => {
                    const cell = solution.getCell({ x, y } as Coords);
                    if (R.isNil(cell)) {
                      console.error(`Can't find cell in solution: ${x}, ${y}`);
                      return "error";
                    }

                    return (
                      <TableCell
                        key={`${x}.${y}`}
                        x={x}
                        y={y}
                        clueKey={cell.clueKey}
                        isBlank={cell.isBlank}
                        isSelected={
                          !!cursor && cursor.x === x && cursor.y === y
                        }
                        onClick={onCellClick}
                      />
                    );
                  }, R.range(0, solution.dimX()))}
                </tr>
              );
            }, R.range(0, solution.dimY()))}
        </tbody>
      </table>
    </div>
  );
};

export default Crossword;
