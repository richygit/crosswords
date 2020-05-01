import React from "react";
import * as R from "ramda";
import { ClueGroupData } from "../lib/SmhCrossword";

interface Props {
  clues: ClueGroupData;
  direction: string;
}

const ClueGroup: React.FC<Props> = ({ clues, direction }) => {
  if (R.isNil(clues)) {
    return <></>;
  }

  return (
    <div>
      <h2>{direction}</h2>
      <ul>
        {clues &&
          clues.keys().map((key: string) => {
            if (clues.hasOwnProperty(key)) {
              const clue = clues[Number.parseInt(key)];
              console.log("key = ", key);
              console.log("clues across = ", clues);
              console.log("clue = ", clue);
              return (
                <li>
                  <span>{key}</span>
                  <span>
                    {clue[0]}({clue[1]})
                  </span>
                </li>
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
