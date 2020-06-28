import React, { useMemo } from "react";
import * as R from "ramda";
import { ClueGroupData } from "../lib/SmhCrossword";
import { Cell, Orientation } from "./Crossword";
import ClueRow from "./ClueRow";
import "./ClueRow.scss";

interface Props {
  clues: ClueGroupData;
  orientation: Orientation;
  cursor: Cell | null;
  cursorDirection: Orientation | null;
  onClick: (e: React.MouseEvent) => void;
}

const ClueGroup: React.FC<Props> = ({
  clues,
  orientation,
  cursor,
  cursorDirection,
  onClick,
}) => {
  const cursorXNo = useMemo(() => (R.isNil(cursor) ? null : cursor.xClueNo), [
    cursor,
  ]);
  const cursorYNo = useMemo(() => (R.isNil(cursor) ? null : cursor.yClueNo), [
    cursor,
  ]);

  if (R.isNil(clues)) {
    return <></>;
  }

  const heading = orientation === Orientation.ACROSS ? "Across" : "Down";

  const isRowSelected = (clueKey: number) => {
    if (orientation !== cursorDirection || R.isNil(orientation)) {
      return false;
    }

    return clueKey === cursorXNo;
  };

  return (
    <div>
      <h2>{heading}</h2>
      <ul>
        {clues &&
          clues.keys().map((key: string) => {
            if (clues.hasOwnProperty(key)) {
              const clueKey = Number.parseInt(key);
              const clue = clues[clueKey];
              return (
                <ClueRow
                  key={clueKey}
                  clueKey={clueKey}
                  clueText={clue[0]}
                  clueLen={clue[1]}
                  isSelected={isRowSelected(clueKey)}
                  orientation={orientation}
                  onClick={onClick}
                />
              );
            } else {
              return <></>;
            }
          })}
      </ul>
    </div>
  );
};

export default ClueGroup;
