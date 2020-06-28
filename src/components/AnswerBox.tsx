import React from "react";
import * as R from "ramda";
import { Cell, Orientation } from "./Crossword";
import "./AnswerBox.scss";
import TableCell from "./TableCell";

interface Props {
  userAnswers: Array<Cell> | null;
  selectedClue: [string, string] | null;
  clueKey: string | null;
  cursor: Cell | null;
  isFocused: boolean;
  selectedAnswerText: string | null;
  onClick: (e: React.MouseEvent) => void;
  onInput: (e: React.FormEvent, c: Cell) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

const AnswerBox: React.FC<Props> = ({
  userAnswers,
  selectedClue,
  clueKey,
  cursor,
  isFocused,
  selectedAnswerText, //force component render by passing this since answers are hidden within 'userAnswers'
  onClick,
  onInput,
  onKeyDown,
}) => {
  if (R.isNil(userAnswers) || R.isNil(selectedClue)) {
    return <div className="__answer-box" />;
  }

  return (
    <div className="__answer-box">
      <div className="clue">
        <span className="clue-key">{clueKey}</span>
        <span className="clue-text">
          {selectedClue[0]} {selectedClue[1]}
        </span>
      </div>
      <table>
        <tbody>
          <tr>
            {userAnswers &&
              userAnswers.map((cell) => {
                return (
                  <TableCell
                    key={`${cell.x}.${cell.y}`}
                    cell={cell}
                    cursor={cursor}
                    answer={cell.answer}
                    isFocused={isFocused}
                    cursorDirection={Orientation.ACROSS}
                    onClick={onClick}
                    onInput={onInput}
                    onKeyDown={onKeyDown}
                  />
                );
              })}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default AnswerBox;
