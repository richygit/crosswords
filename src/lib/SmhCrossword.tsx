import { Cell } from "../components/Crossword";
import * as R from "ramda";
import { Coords, SolutionMatrix } from "../components/Matrix";

export interface ClueGroupData {
  // clue key no =>  [clue text, word char count]
  [key: number]: [string, number]; //array tuple
  //returns the keys of the object
  keys: () => Array<string>;
}

class SmhCrossword {
  public matrix: SolutionMatrix;
  //matrix for transmission
  public compressedMatrix: Array<Array<string | null>>;
  public cluesAcross: any;
  public cluesDown: any;
  constructor(dom: Document) {
    const [matrix, compressed] = this.readMatrix(dom);
    this.matrix = matrix;
    this.compressedMatrix = compressed;

    SmhCrossword.setMatrixClues(this.matrix);
    const [across, down] = this.readClues(dom);
    this.cluesAcross = across; //{ref -> [clue, letter count]}
    this.cluesDown = down;

    // window.dom = dom;
  }

  private static isActiveCell = (coords: Coords, matrix: SolutionMatrix) => {
    const cell = matrix.getCell(coords);
    return !R.isNil(cell) && !cell.isBlank;
  };

  //returns true if this is a starting cell
  private static checkCell = (
    cell: Cell | null,
    coords: Coords,
    key: number,
    matrix: SolutionMatrix
  ): boolean => {
    let isStartingCell = false;

    if (R.isNil(cell)) {
      return isStartingCell;
    }
    const x = coords.x;
    const y = coords.y;

    if (cell.isBlank) {
      return isStartingCell;
    }

    if (!SmhCrossword.isActiveCell({ x, y } as Coords, matrix)) {
      return isStartingCell;
    }

    // horizontal check - there's no active cell to the left
    if (!SmhCrossword.isActiveCell({ x: x - 1, y } as Coords, matrix)) {
      if (SmhCrossword.isActiveCell({ x: x + 1, y } as Coords, matrix)) {
        // if cell has no cell to left but has a cell to the right, then it's a clue start
        cell.isStart = true;
        isStartingCell = true;
        cell.clueKey = key;
        cell.xClueNo = key;
      }
    } else {
      //there's an active cell to the left - copy the xClueKey
      const left = matrix.getCell({ x: x - 1, y });
      cell.xClueNo = left ? left.xClueNo : null;
    }

    // vertical key check
    if (!SmhCrossword.isActiveCell({ x, y: y - 1 } as Coords, matrix)) {
      //no cell above

      if (SmhCrossword.isActiveCell({ x, y: y + 1 } as Coords, matrix)) {
        //if there is also a cell below, then this is a clue start
        cell.isStart = true;
        isStartingCell = true;
        cell.clueKey = key;
        cell.yClueNo = key;
      }
    } else {
      //there's an active cell above - copy the yClueKey
      const above = matrix.getCell({ x, y: y - 1 });
      cell.yClueNo = above ? above.yClueNo : null;
    }

    //increment at the end so we don't double count starting in both directions for the same cell
    return isStartingCell;
  };

  public static solutionMatrixFromData = (
    data: Array<Array<string | undefined>>
  ): SolutionMatrix => {
    const cellData: Array<Array<Cell>> = data.map(
      (row: Array<string | undefined>, y) => {
        return row.map((txt: string | undefined, x) => {
          return {
            solution: txt,
            isBlank: R.isNil(txt),
            answer: "",
            clueKey: null,
            isStart: false,
            xClueNo: null,
            yClueNo: null,
            x,
            y,
          } as Cell;
        });
      }
    );
    const solutionMatrix = new SolutionMatrix(cellData);
    SmhCrossword.setMatrixClues(solutionMatrix);
    return solutionMatrix;
  };

  private static setMatrixClues = (matrix: SolutionMatrix) => {
    //set the clue keys based on blanks
    let key = 1;

    R.forEach((y) => {
      R.forEach((x) => {
        const coords = { x, y } as Coords;
        const isStartingCell = SmhCrossword.checkCell(
          matrix.getCell(coords),
          coords,
          key,
          matrix
        );
        key = isStartingCell ? key + 1 : key;
      }, R.range(0, matrix.dimX()));
    }, R.range(0, matrix.dimY()));
  };

  private readMatrix(
    dom: Document
  ): [SolutionMatrix, Array<Array<string | null>>] {
    const data: Array<Array<Cell>> = [];
    const compressed: Array<Array<string | null>> = [];

    const rows = dom.querySelectorAll("#crossword table.printOnly tr");
    Array.from(rows).forEach((tr, y) => {
      const dataRow: Array<Cell> = [];
      const compressedRow: Array<string | null> = [];
      const cells = tr.querySelectorAll("td");

      Array.from(cells).forEach((td, x) => {
        const txt = td.textContent;
        const isBlank = R.isNil(txt) || txt.trim().length === 0;
        dataRow.push({
          solution: txt,
          answer: "",
          isBlank: isBlank,
          clueKey: null,
          isStart: false,
          xClueNo: null,
          yClueNo: null,
          x,
          y,
        });
        compressedRow.push(isBlank ? null : txt);
      });

      data.push(dataRow);
      compressed.push(compressedRow);
    });

    return [new SolutionMatrix(data), compressed];
  }

  public static clueGroupData = (): ClueGroupData => {
    return {
      keys: function () {
        return R.without(["keys"], Object.keys(this)); //don't include this function in the list
      },
    };
  };

  private readClueGroup(group: Element) {
    const buttons: NodeListOf<Element> = group.querySelectorAll("button");
    const clues: ClueGroupData = SmhCrossword.clueGroupData();

    Array.from(buttons).forEach((btn) => {
      const ref: string = btn.getAttribute("data-position")!;
      const clueText = btn.querySelector("span:last-child")!.textContent!;
      const sep = clueText!.lastIndexOf("(");
      if (sep >= 0) {
        const text = clueText!.slice(0, sep).trim();
        const len = clueText!.slice(sep, -1).replace(/[^\d]/g, "");
        clues[Number.parseInt(ref)] = [text, Number.parseInt(len)];
      } else {
        clues[Number.parseInt(ref)] = [clueText, -1];
      }
    });

    return clues;
  }

  private readClues(dom: Document) {
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
