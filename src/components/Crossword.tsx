import React, { useEffect, useState } from "react";
import { ClueGroupData } from "../lib/SmhCrossword";
import * as R from "ramda";
import "./Crossword.scss";
import TableCell from "./TableCell";
import { AnswerMatrix, Coords, SolutionMatrix } from "./Matrix";
import ClueGroup from "./ClueGroup";

interface CrosswordProps {
  matrix: SolutionMatrix;
  cluesAcross: ClueGroupData;
  cluesDown: ClueGroupData;
}

enum Direction {
  LEFT,
  UP,
  RIGHT,
  DOWN,
}

export enum Orientation {
  ACROSS,
  DOWN,
}

export interface Cell {
  clueKey: number | null; // the clue number to display in the corner
  answer: string | null;
  isBlank: boolean;
  isStart: boolean;
  xClueNo: number | null;
  yClueNo: number | null;
  x: number;
  y: number;
}

const Crossword: React.FC<CrosswordProps> = ({
  matrix: solution,
  cluesAcross,
  cluesDown,
}) => {
  const [answers, setAnswers] = useState<AnswerMatrix | null>(null);
  const [cursor, setCursor] = useState<Coords | null>(null);
  //indicates which direction the clue is pointing in if it is ambiguous
  const [cursorDirection, setCursorDirection] = useState<Orientation>(
    Orientation.ACROSS
  );
  const [xClueNoSelected, setXClueNoSelected] = useState<number | null>(null);
  const [yClueNoSelected, setYClueNoSelected] = useState<number | null>(null);
  // used to determine if the selected clue should be updated. in the case
  // where the cursor moved by editing - we don't want to update the selection
  // we only want to move the cursor one cell along
  const [wasTyping, setWasTyping] = useState<boolean>(false);

  useEffect(() => {
    if (R.isNil(answers)) {
      // init user matrix
      setAnswers(new AnswerMatrix(solution));
    }
  }, [solution, answers]);

  useEffect(() => {
    //if the cursor changes, update the selected clueNo
    if (R.isNil(cursor)) {
      //reset the selected clueNos
      setXClueNoSelected(null);
      setYClueNoSelected(null);
      return;
    }

    //cursor is selected, check if we can set the selected clueNos
    const selectedCell = solution.getCell(cursor);
    if (R.isNil(selectedCell)) {
      return;
    }

    updateSelection(selectedCell);
  }, [solution, cursor]);

  const updateSelection = (selectedCell: Cell) => {
    if (wasTyping && (xClueNoSelected || yClueNoSelected)) {
      // typing should not change the selection
      return;
    }

    const xClueNo = selectedCell.xClueNo;
    const yClueNo = selectedCell.yClueNo;

    if (!R.isNil(xClueNo) && R.isNil(yClueNo)) {
      setXClueNoSelected(xClueNo);
      setYClueNoSelected(null);
    } else if (R.isNil(xClueNo) && !R.isNil(yClueNo)) {
      setXClueNoSelected(null);
      setYClueNoSelected(yClueNo);
    } else if (!R.isNil(xClueNo) && !R.isNil(yClueNo)) {
      // both directions possible, alternate direction each click
      if (R.isNil(xClueNoSelected)) {
        setXClueNoSelected(xClueNo);
        setYClueNoSelected(null);
      } else {
        setXClueNoSelected(null);
        setYClueNoSelected(yClueNo);
      }
    } else {
      setXClueNoSelected(null);
      setYClueNoSelected(null);
    }
  };

  const coordsFromId = (id: string): Coords => {
    const coords = id.split(".");
    const x = Number.parseInt(coords[0]);
    const y = Number.parseInt(coords[1]);
    return { x, y } as Coords;
  };

  const onCellClick = (e: React.MouseEvent): void => {
    e.preventDefault();
    let elem: Element = e.target as Element;
    if (elem && elem.nodeName !== "TD") {
      elem = elem.parentElement as Element;
    }

    setWasTyping(false);
    const coords = coordsFromId(elem.id);
    // R.equals: compares attributes
    if (R.equals(cursor, coords)) {
      //double click means toggle direction
      setCursorDirection((cursorDirection + 1) % 1);
    }
    setCursor(coords);
  };

  const moveCursorArrowKeys = (direction: Direction) => {
    if (R.isNil(cursor)) {
      return;
    }

    let x = cursor.x;
    let y = cursor.y;

    switch (direction) {
      case Direction.LEFT:
        x -= 1;
        break;
      case Direction.UP:
        y -= 1;
        break;
      case Direction.RIGHT:
        x += 1;
        break;
      case Direction.DOWN:
        y += 1;
        break;
    }

    const newCoords = { x, y } as Coords;
    const newCell = solution.getCell(newCoords);
    if (!R.isNil(newCell) && !newCell.isBlank) {
      setCursor(newCoords);
      setWasTyping(false);
    }
  };

  const onCellKeyDown = (e: React.KeyboardEvent): void => {
    const target = e.target as HTMLInputElement;
    target.setSelectionRange(0, target.value.length);

    //key codes
    const BACKSPACE = 8,
      LEFT = 37,
      UP = 38,
      RIGHT = 39,
      DOWN = 40;

    switch (e.keyCode) {
      case BACKSPACE:
        if (R.isEmpty(target.value)) {
          //allow backspace to work over empty values
          moveCursor(target, false);
        }
        break;
      case LEFT:
        moveCursorArrowKeys(Direction.LEFT);
        break;
      case UP:
        moveCursorArrowKeys(Direction.UP);
        break;
      case RIGHT:
        moveCursorArrowKeys(Direction.RIGHT);
        break;
      case DOWN:
        moveCursorArrowKeys(Direction.DOWN);
        break;
    }
  };

  const onCellInput = (e: React.FormEvent): void => {
    setWasTyping(true);

    if (R.isNil(cursor)) {
      return;
    }

    const target = e.target as HTMLInputElement;

    const val = target.value;

    const moveForwards = !R.isEmpty(val);

    moveCursor(target, moveForwards);
  };

  const onClueClick = (e: React.MouseEvent) => {
    let target = e.currentTarget;
    const orientationStr = target.getAttribute("data-orientation");
    const clueNoStr = target.getAttribute("data-clueno");

    if (R.isNil(orientationStr) || R.isNil(clueNoStr)) {
      return;
    }

    const orientation = Number.parseInt(orientationStr);
    const clueNo = Number.parseInt(clueNoStr);

    if (R.isNil(orientation)) {
      return;
    }

    //identify the cell we want to set the cursor to
    const startCoords = solution.findStartCoords(
      orientation,
      Number.parseInt(clueNoStr)
    );

    if (startCoords) {
      //mark it as mouse selected
      setWasTyping(false);
      setCursorDirection(orientation);
      setCursor(startCoords);
    }
  };

  const moveCursor = (target: Element, forwards: boolean) => {
    const moveDelta = forwards ? 1 : -1;

    const name = target.getAttribute("name");
    if (R.isNil(name)) {
      return;
    }
    const coords = coordsFromId(name);

    let nextCoords = null;
    //move to next cell if we can
    if (xClueNoSelected) {
      nextCoords = { x: coords.x + moveDelta, y: coords.y } as Coords;
    } else if (yClueNoSelected) {
      nextCoords = { x: coords.x, y: coords.y + moveDelta } as Coords;
    } else {
      return;
    }

    const next = solution.getCell(nextCoords);

    if (!R.isNil(next) && !next.isBlank) {
      setCursor(nextCoords);
    }
  };

  return (
    <div>
      <h1>Puzzle cds or rows transformed (9)</h1>
      <div className="matrix-container">
        <table className="crossword__matrix">
          <tbody>
            {solution &&
              R.map((y) => {
                return (
                  <tr className="row" key={y}>
                    {R.map((x) => {
                      const cell = solution.getCell({ x, y } as Coords);
                      if (R.isNil(cell)) {
                        console.error(
                          `Can't find cell in solution: ${x}, ${y}`
                        );
                        return "error";
                      }

                      return (
                        <TableCell
                          key={`${x}.${y}`}
                          x={x}
                          y={y}
                          clueKey={cell.clueKey}
                          isBlank={cell.isBlank}
                          isCursor={
                            !!cursor && cursor.x === x && cursor.y === y
                          }
                          isSelected={
                            (cell.xClueNo === xClueNoSelected &&
                              !R.isNil(xClueNoSelected)) ||
                            (cell.yClueNo === yClueNoSelected &&
                              !R.isNil(yClueNoSelected))
                          }
                          onClick={onCellClick}
                          onInput={onCellInput}
                          onKeyDown={onCellKeyDown}
                        />
                      );
                    }, R.range(0, solution.dimX()))}
                  </tr>
                );
              }, R.range(0, solution.dimY()))}
          </tbody>
        </table>
      </div>
      <div className="clues">
        <div className="across">
          <ClueGroup
            clues={cluesAcross}
            orientation={Orientation.ACROSS}
            onClick={onClueClick}
            xClueNoSelected={xClueNoSelected}
            yClueNoSelected={yClueNoSelected}
          />
        </div>
        <div className="down">
          <ClueGroup
            clues={cluesDown}
            orientation={Orientation.DOWN}
            onClick={onClueClick}
            xClueNoSelected={xClueNoSelected}
            yClueNoSelected={yClueNoSelected}
          />
        </div>
      </div>
    </div>
  );
};

export default Crossword;
