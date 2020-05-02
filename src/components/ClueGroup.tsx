import React from "react";
import * as R from "ramda";
import { ClueGroupData } from "../lib/SmhCrossword";
import { Orientation } from "./Crossword";
import ClueRow from "./ClueRow";
import "./ClueRow.scss";

interface Props {
  clues: ClueGroupData;
  orientation: Orientation;
  onClick: (e: React.MouseEvent) => void;
  xClueNoSelected: number | null;
  yClueNoSelected: number | null;
}

const ClueGroup: React.FC<Props> = ({
  clues,
  orientation,
  onClick,
  xClueNoSelected,
  yClueNoSelected,
}) => {
  if (R.isNil(clues)) {
    return <></>;
  }

  const heading = orientation === Orientation.ACROSS ? "Across" : "Down";

  const isRowSelected = (
    xSelectedNo: number | null,
    ySelectedNo: number | null,
    clueOrientation: Orientation,
    currClueKey: number
  ) => {
    if (clueOrientation === Orientation.ACROSS && R.isNil(xSelectedNo)) {
      return false;
    }
    if (clueOrientation === Orientation.DOWN && R.isNil(ySelectedNo)) {
      return false;
    }

    const key =
      clueOrientation === Orientation.ACROSS ? xSelectedNo : ySelectedNo;

    return key === currClueKey;
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
                  clueKey={clueKey}
                  clueText={clue[0]}
                  clueNo={clue[1]}
                  isSelected={isRowSelected(
                    xClueNoSelected,
                    yClueNoSelected,
                    orientation,
                    clueKey
                  )}
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
