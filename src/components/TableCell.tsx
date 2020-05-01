import React from "react";
import classNames from "classnames";
import { Cell } from "./Crossword";

interface Props {
  x: number;
  y: number;
  clueKey: number | null;
  isBlank: boolean;
  isCursor: boolean;
  isSelected: boolean;
  onClick: (e: React.MouseEvent) => void;
}

const TableCell: React.FC<Props> = ({
  x,
  y,
  clueKey,
  isBlank,
  isCursor,
  isSelected,
  onClick,
}) => {
  const tdClass = classNames({
    cell: true,
    blank: isBlank,
    cursor: isCursor,
    selected: isSelected,
  });

  return (
    <td className={tdClass} onClick={onClick} id={`${x}.${y}`}>
      <input name={`${x}-${y}`} type="text" maxLength={1} />
      <span>{clueKey}</span>
    </td>
  );
};

export default TableCell;
