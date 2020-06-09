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
  onClick: (e: React.MouseEvent) => void;
}

const ClueGroup: React.FC<Props> = ({
  clues,
  orientation,
  cursor,
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

  const isRowSelected = (clueKey: number, clueOrientation: Orientation) => {
    if (clueOrientation === Orientation.ACROSS && clueKey === cursorXNo) {
      return true;
    }

    return clueOrientation === Orientation.DOWN && clueKey === cursorYNo;
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
                  isSelected={isRowSelected(clueKey, orientation)}
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
