import React from "react";
import classNames from "classnames";
import { Cell } from "./Crossword";

interface Props {
  x: number;
  y: number;
  clueKey: number | null;
  isBlank: boolean;
  isSelected: boolean;
  onClick: (e: React.MouseEvent) => void;
}

const TableCell: React.FC<Props> = ({
  x,
  y,
  clueKey,
  isBlank,
  isSelected,
  onClick,
}) => {
  const tdClass = classNames({
    cell: true,
    blank: isBlank,
    selected: isSelected,
  });

  return (
    <td className={tdClass} onClick={onClick} id={`${x}.${y}`}>
      <input name={`${x}-${y}`} type="text" />
      <span>{clueKey}</span>
    </td>
  );
};

export default TableCell;
