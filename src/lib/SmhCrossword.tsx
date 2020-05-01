import { Cell, Matrix } from "../components/Crossword";
import * as R from "ramda";

export interface ClueGroup {
  [key: string]: [String, number]; //array tuple
}

class SmhCrossword {
  public matrix: Matrix;
  public cluesAcross: any;
  public cluesDown: any;
  constructor(dom: Document) {
    this.matrix = this.readMatrix(dom);
    const [across, down] = this.readClues(dom);
    this.cluesAcross = across; //{ref -> [clue, letter count]}
    this.cluesDown = down;

    // window.dom = dom;
  }

  setClueConfig(matrix: Matrix): Matrix {
    //set the clue keys based on blanks
    let key = 1;
    const withIndex = R.addIndex(R.map);

    const lowerBound = R.flip(R.gte)(0);

    const isActiveCell = (x: number, y: number) => {
      return (
        lowerBound(x) &&
        R.lt(x, matrix[0].length) &&
        lowerBound(y) &&
        R.lt(y, matrix.length) &&
        !matrix[y][x].isBlank
      );
    };

    const getCell = (x: number, y: number): Cell | null => {
      if (!isActiveCell(x, y)) {
        return null;
      }
      return matrix[y][x];
    };

    const checkCell = (cell: Cell, x: number, y: number) => {
      if (cell.isBlank) {
        return;
      }

      if (!isActiveCell(x, y)) {
        return;
      }

      let isStartingCell = false;

      // horizontal check - there's no active cell to the left
      if (!isActiveCell(x - 1, y)) {
        if (isActiveCell(x + 1, y)) {
          // if cell has no cell to left but has a cell to the right, then it's a clue start
          cell.isStart = true;
          isStartingCell = true;
          cell.clueKey = key;
          cell.xClueNo = key;
        }
      } else {
        //there's an active cell to the left - copy the xClueKey
        const left = getCell(x - 1, y);
        cell.xClueNo = left ? left.xClueNo : null;
      }

      // vertical key check
      if (!isActiveCell(x, y - 1)) {
        //no cell above

        if (isActiveCell(x, y + 1)) {
          //if there is also a cell below, then this is a clue start
          cell.isStart = true;
          isStartingCell = true;
          cell.clueKey = key;
          cell.yClueNo = key;
        }
      } else {
        //there's an active cell above - copy the yClueKey
        const above = getCell(x, y - 1);
        cell.yClueNo = above ? above.yClueNo : null;
      }

      //increment at the end so we don't double count starting in both directions for the same cell
      if (isStartingCell) {
        key += 1;
      }
    };

    //check all the cells
    withIndex(
      (row, y) =>
        withIndex(
          (cell, x) => checkCell(cell as Cell, x, y),
          row as Array<Cell>
        ),
      matrix
    );

    console.log(matrix);
    return matrix;
  }

  readMatrix(dom: Document): Matrix {
    const matrix: Matrix = [];
    const rows = dom.querySelectorAll("#crossword table.printOnly tr");
    Array.from(rows).forEach((tr) => {
      const dataRow: Array<Cell> = [];
      const cells = tr.querySelectorAll("td");
      Array.from(cells).forEach((td) => {
        const txt = td.textContent;
        return dataRow.push({
          answer: txt,
          isBlank: !R.isNil(txt) && txt.trim().length === 0,
          clueKey: null,
          isStart: false,
          xClueNo: null,
          yClueNo: null,
        });
      });
      matrix.push(dataRow);
    });

    return this.setClueConfig(matrix);
  }

  readClueGroup(group: Element) {
    const buttons: NodeListOf<Element> = group.querySelectorAll("button");
    const clues: ClueGroup = {};

    Array.from(buttons).forEach((btn) => {
      const ref: String = btn.getAttribute("data-position")!;
      const clueText = btn.querySelector("span:last-child")!.textContent!;
      const sep = clueText!.lastIndexOf("(");
      if (sep >= 0) {
        const text = clueText!.slice(0, sep).trim();
        const len = clueText!.slice(sep, -1).replace(/[^\d]/g, "");
        clues[ref.toString()] = [text, Number.parseInt(len)];
      } else {
        clues[ref.toString()] = [clueText, -1];
      }
    });

    return clues;
  }

  readClues(dom: Document) {
    const groups: Array<Element> = Array.from(
      dom.querySelectorAll("#crossword-clues > div")
    );
    const acrossIdx = groups.findIndex((group) => {
      const elem: Element | null = group.querySelector("div:first-child");
      if (elem && elem.textContent) {
        return elem.textContent.trim().toLowerCase() === "across";
      } else {
        throw new Error("Unable to determine clue groups.");
      }
    });
    if (acrossIdx < 0) {
      console.error("Unable to identify across and down clue groups.");
      return [null, null];
    }
    const across = groups.splice(acrossIdx, 1)[0];
    const down = groups.pop();

    if (!down) {
      throw new Error("Unable to locate down clues.");
    }

    return [this.readClueGroup(across), this.readClueGroup(down)];
  }
}

export default SmhCrossword;
