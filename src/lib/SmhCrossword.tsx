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

  setClueKeys(matrix: Matrix): Matrix {
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
        !matrix[y][x].blank
      );
    };

    const cellCheck = (cell: Cell, x: number, y: number) => {
      if (cell.blank) {
        return;
      }

      if (!isActiveCell(x, y)) {
        return;
      }

      // horizontal key check
      // if cell has no cell to left and cell to the right, then it's a key
      if (!isActiveCell(x - 1, y) && isActiveCell(x + 1, y)) {
        cell.clueKey = key;
        key += 1;
        return;
      }

      // vertical key check
      // if cell has no cell above, but cell below, then it's a key
      if (!isActiveCell(x, y - 1) && isActiveCell(x, y + 1)) {
        cell.clueKey = key;
        key += 1;
        return;
      }
    };
    withIndex(
      (row, y) =>
        withIndex(
          (cell, x) => cellCheck(cell as Cell, x, y),
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
          blank: !R.isNil(txt) && txt.trim().length === 0,
          clueKey: 0,
        });
      });
      matrix.push(dataRow);
    });

    return this.setClueKeys(matrix);
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
