import React from "react";
import classNames from "classnames";

interface Props {
  clueKey: number;
  clueText: string;
  clueNo: number;
  isSelected: boolean;
  onClick: (e: React.MouseEvent) => void;
}

const ClueRow: React.FC<Props> = ({
  clueKey,
  clueText,
  clueNo,
  isSelected,
  onClick,
}) => {
  const liClass = classNames({
    clue__row: true,
    selected: isSelected,
  });

  return (
    <li className={liClass} onClick={onClick}>
      <span>{clueKey}</span>
      <span>
        {clueText}({clueNo})
      </span>
    </li>
  );
};

export default ClueRow;
