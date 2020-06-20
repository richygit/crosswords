import React, { useEffect, useMemo, useRef } from "react";
import * as R from "ramda";
import classNames from "classnames";
import { Cell, Orientation } from "./Crossword";

interface Props {
  cell: Cell;
  cursor: Cell | null;
  cursorDirection: Orientation | null;
  onClick: (e: React.MouseEvent) => void;
  onInput: (e: React.FormEvent) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

const TableCell: React.FC<Props> = ({
  cell,
  cursor,
  cursorDirection,
  onClick,
  onInput,
  onKeyDown,
}) => {
  const isCursor = useMemo(() => {
    if (R.isNil(cursor)) {
      return false;
    }

    return cell.x === cursor.x && cell.y === cursor.y;
  }, [cursor, cell]);

  const isBlank = useMemo(() => cell.isBlank, [cell]);

  const isSelected = useMemo(() => {
    if (R.isNil(cursor) || R.isNil(cursorDirection)) {
      return false;
    }

    if (cursorDirection === Orientation.ACROSS) {
      return !R.isNil(cursor.xClueNo) && cursor.xClueNo === cell.xClueNo;
    } else {
      return !R.isNil(cursor.yClueNo) && cursor.yClueNo === cell.yClueNo;
    }
  }, [cell, cursor, cursorDirection]);

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
      inputField.current?.setSelectionRange(
        0,
        inputField.current?.value.length
      );
    }
  }, [isCursor]);

  const onCellInput = (e: React.FormEvent) => {
    const target = e.target as HTMLInputElement;
    cell.answer = target.value;

    onInput(e);
  };

  return (
    <td className={tdClass} onClick={onClick} id={`${cell.x}.${cell.y}`}>
      <input
        ref={inputField}
        name={`${cell.x}.${cell.y}`}
        type="text"
        maxLength={1}
        onInput={onCellInput}
        onKeyDown={onKeyDown}
      />
      <span>{cell.clueKey}</span>
    </td>
  );
};

export default TableCell;
