import React from "react";
import classNames from "classnames";
import { Orientation } from "./Crossword";
import { or } from "ramda";

interface Props {
  clueKey: number;
  clueText: string;
  clueLen: number;
  isSelected: boolean;
  orientation: Orientation;
  onClick: (e: React.MouseEvent) => void;
}

const ClueRow: React.FC<Props> = ({
  clueKey,
  clueText,
  clueLen,
  isSelected,
  orientation,
  onClick,
}) => {
  const liClass = classNames({
    clue__row: true,
    selected: isSelected,
  });

  const dataAttributes = {
    "data-orientation": orientation,
    "data-clueno": clueKey,
  };

  return (
    <li className={liClass} onClick={onClick} {...dataAttributes}>
      <span className="key">{clueKey}</span>
      <span className="text">
        {clueText} <span className="length">({clueLen})</span>
      </span>
    </li>
  );
};

export default ClueRow;
