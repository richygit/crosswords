import React from "react";
import * as R from "ramda";
import { Cell, Orientation } from "./Crossword";
import "./AnswerBox.scss";

interface Props {
  solutionCells: Array<Cell> | null;
  selectedClue: [string, number] | null;
  clueKey: string | null;
}

const AnswerBox: React.FC<Props> = ({
  solutionCells,
  selectedClue,
  clueKey,
}) => {
  if (R.isNil(solutionCells) || R.isNil(selectedClue)) {
    return <div className="__answer-box" />;
  }

  return (
    <div className="__answer-box">
      <div className="clue">
        <span>{clueKey}:</span>
        <span>
          {selectedClue[0]} [{selectedClue[1]}]
        </span>
      </div>
      <table>
        <tbody>
          <tr>
            {solutionCells &&
              solutionCells.map((cell) => {
                return (
                  <td className="td" key={`${cell.x}.${cell.y}`}>
                    <input
                      type="text"
                      maxLength={1}
                      defaultValue={R.isNil(cell.answer) ? "" : cell.answer}
                    />
                  </td>
                );
              })}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default AnswerBox;
