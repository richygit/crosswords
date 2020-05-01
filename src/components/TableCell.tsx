import React, { useEffect, useRef } from "react";
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
  onInput: (e: React.FormEvent) => void;
}

const TableCell: React.FC<Props> = ({
  x,
  y,
  clueKey,
  isBlank,
  isCursor,
  isSelected,
  onClick,
  onInput,
}) => {
  const tdClass = classNames({
    cell: true,
    blank: isBlank,
    cursor: isCursor,
    selected: isSelected,
  });

  const inputField = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCursor && inputField) {
      inputField.current?.focus();
    }
  }, [isCursor]);

  return (
    <td className={tdClass} onClick={onClick} id={`${x}.${y}`}>
      <input
        ref={inputField}
        name={`${x}.${y}`}
        type="text"
        maxLength={1}
        onInput={onInput}
      />
      <span>{clueKey}</span>
    </td>
  );
};

export default TableCell;
