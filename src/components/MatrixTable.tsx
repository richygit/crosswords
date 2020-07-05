import React from "react";
import * as R from "ramda";
import { Coords, SolutionMatrix } from "./Matrix";
import TableCell from "./TableCell";
import { Cell, Orientation } from "./Crossword";

interface Props {
  solution: SolutionMatrix;
  cursor: Cell | null;
  cursorDirection: Orientation | null;
  isMatrixFocused: boolean;
  onClick: (e: React.MouseEvent) => void;
  onInput: (e: React.FormEvent, cell: Cell) => void;
  onKeyDown: (e: React.KeyboardEvent, isTableCell: boolean) => void;
}

const MatrixTable: React.FC<Props> = ({
  solution,
  cursor,
  cursorDirection,
  isMatrixFocused,
  onClick,
  onInput,
  onKeyDown,
}) => {
  return (
    <div className="matrix-container">
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
                        cell={cell}
                        cursor={cursor}
                        answer={cell.answer}
                        isFocused={isMatrixFocused}
                        cursorDirection={cursorDirection}
                        onClick={onClick}
                        onInput={onInput}
                        onKeyDown={(e) => onKeyDown(e, true)}
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

export default MatrixTable;
