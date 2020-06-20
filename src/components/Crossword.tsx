import React, { useState } from "react";
import { ClueGroupData } from "../lib/SmhCrossword";
import * as R from "ramda";
import { isNil } from "ramda";
import "./Crossword.scss";
import TableCell from "./TableCell";
import { Coords, SolutionMatrix } from "./Matrix";
import ClueGroup from "./ClueGroup";
import AnswerBox from "./AnswerBox";

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
  solution: string | null;
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
  // crossword answers
  const [cursor, setCursor] = useState<Cell | null>(null);
  const [cursorDirection, setCursorDirection] = useState<Orientation | null>(
    null
  );

  const coordsFromId = (id: string): Coords => {
    const coords = id.split(".");
    const x = Number.parseInt(coords[0]);
    const y = Number.parseInt(coords[1]);
    return { x, y } as Coords;
  };

  // toggle the cursor direction, unless the other direction is not valid
  const toggleCursorDirection = () => {
    if (isNil(cursorDirection)) {
      return;
    }

    if (
      cursorDirection === Orientation.ACROSS &&
      cursor &&
      !R.isNil(cursor.yClueNo)
    ) {
      setCursorDirection(Orientation.DOWN);
    } else if (
      cursorDirection === Orientation.DOWN &&
      cursor &&
      !R.isNil(cursor.yClueNo)
    ) {
      setCursorDirection(Orientation.ACROSS);
    }
  };

  //return false if a or b are nil
  const isSameCell = (a: Cell | null, b: Cell | null): boolean => {
    if (isNil(a) || isNil(b)) {
      return false;
    }
    return a.x === b.x && a.y === b.y;
  };

  const updateCursorDirection = (cell: Cell | null) => {
    if (isNil(cell)) {
      return;
    }

    if (!isNil(cell.xClueNo)) {
      // default to across, even if there is a Y clue number
      setCursorDirection(Orientation.ACROSS);
    } else if (!isNil(cell.yClueNo)) {
      setCursorDirection(Orientation.DOWN);
    } else {
      setCursorDirection(null);
    }
  };

  const onCellClick = (e: React.MouseEvent): void => {
    e.preventDefault();
    let elem: Element = e.target as Element;
    if (elem && elem.nodeName !== "TD") {
      elem = elem.parentElement as Element;
    }

    const coords = coordsFromId(elem.id);
    const clickedCell = solution.getCell(coords);
    if (isSameCell(clickedCell, cursor)) {
      toggleCursorDirection();
    } else {
      setCursor(clickedCell);
      updateCursorDirection(clickedCell);
    }
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

    const newCell = solution.getCell({ x, y } as Coords);
    if (!R.isNil(newCell) && !newCell.isBlank) {
      setCursor(newCell);
      updateCursorDirection(newCell);
    }
  };

  // move or backspace actions
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
          editCellEvent(target, false);
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

  // typing solution event
  const onCellInput = (e: React.FormEvent): void => {
    if (R.isNil(cursor)) {
      return;
    }

    const target = e.target as HTMLInputElement;
    const val = target.value;

    const moveForwards = !R.isEmpty(val);

    editCellEvent(target, moveForwards);
  };

  const onClueClick = (e: React.MouseEvent) => {
    let target = e.currentTarget;
    const orientationStr = target.getAttribute("data-orientation");
    const clueNoStr = target.getAttribute("data-clueno");

    if (R.isNil(orientationStr) || R.isNil(clueNoStr)) {
      return;
    }

    const orientation = Number.parseInt(orientationStr);

    if (R.isNil(orientation)) {
      return;
    }

    //identify the cell we want to set the cursor to
    const startCoords = solution.findStartCoords(
      orientation,
      Number.parseInt(clueNoStr)
    );

    if (startCoords) {
      setCursor(solution.getCell(startCoords));
      setCursorDirection(orientation);
    }
  };

  // called when a cell is edited. Move the cursor.
  const editCellEvent = (target: Element, forwards: boolean) => {
    const moveDelta = forwards ? 1 : -1;

    const name = target.getAttribute("name");
    if (R.isNil(name)) {
      return;
    }
    const coords = coordsFromId(name);

    let nextCoords = null;
    //move to next cell if we can
    if (cursorDirection === Orientation.ACROSS) {
      nextCoords = { x: coords.x + moveDelta, y: coords.y } as Coords;
    } else if (cursorDirection === Orientation.DOWN) {
      nextCoords = { x: coords.x, y: coords.y + moveDelta } as Coords;
    } else {
      return;
    }

    const next = solution.getCell(nextCoords);

    if (!R.isNil(next) && !next.isBlank) {
      setCursor(next);
    }
  };

  // returns the cells for the selected solution to render in the solution box
  const answerBoxFields = (): [
    Array<Cell> | null,
    [string, number] | null,
    string | null
  ] => {
    if (R.isNil(cursor)) {
      return [null, null, null];
    }

    let solutionCells: Array<Cell> | null;
    let clueText: [string, number] | null = null;
    let clueKey: string | null = null;

    if (cursorDirection === Orientation.ACROSS || R.isNil(cursorDirection)) {
      solutionCells = solution.getClueCells(cursor.xClueNo, null);
      if (R.isNil(cursor.xClueNo)) {
        clueText = null;
        clueKey = null;
      } else {
        clueText = cluesAcross[cursor.xClueNo];
        clueKey = `${cursor.xClueNo}A`;
      }
    } else {
      solutionCells = solution.getClueCells(null, cursor.yClueNo);
      if (R.isNil(cursor.yClueNo)) {
        clueText = null;
        clueKey = null;
      } else {
        clueText = cluesDown[cursor.yClueNo];
        clueKey = `${cursor.yClueNo}D`;
      }
    }

    return [solutionCells, clueText, clueKey];
  };

  const answerBoxParams = answerBoxFields();

  return (
    <>
      <h1>Puzzle cds or rows transformed (9)</h1>
      <div className="crossword__container">
        <div className="answer-container">
          <AnswerBox
            userAnswers={answerBoxParams[0]}
            selectedClue={answerBoxParams[1]}
            clueKey={answerBoxParams[2]}
          />
        </div>
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
                            cell={cell}
                            cursor={cursor}
                            cursorDirection={cursorDirection}
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
        <div className="across">
          <ClueGroup
            clues={cluesAcross}
            orientation={Orientation.ACROSS}
            cursor={cursor}
            onClick={onClueClick}
          />
        </div>
        <div className="down">
          <ClueGroup
            clues={cluesDown}
            orientation={Orientation.DOWN}
            cursor={cursor}
            onClick={onClueClick}
          />
        </div>
      </div>
    </>
  );
};

export default Crossword;
