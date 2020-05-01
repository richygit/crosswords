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
  public cluesAcross: any;
  public cluesDown: any;
  constructor(dom: Document) {
    this.matrix = this.readMatrix(dom);
    this.setMatrixClues();
    const [across, down] = this.readClues(dom);
    this.cluesAcross = across; //{ref -> [clue, letter count]}
    this.cluesDown = down;

    // window.dom = dom;
  }

  private isActiveCell = (coords: Coords) => {
    const cell = this.matrix.getCell(coords);
    return !R.isNil(cell) && !cell.isBlank;
  };

  //returns true if this is a starting cell
  private checkCell = (
    cell: Cell | null,
    coords: Coords,
    key: number
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

    if (!this.isActiveCell({ x, y } as Coords)) {
      return isStartingCell;
    }

    // horizontal check - there's no active cell to the left
    if (!this.isActiveCell({ x: x - 1, y } as Coords)) {
      if (this.isActiveCell({ x: x + 1, y } as Coords)) {
        // if cell has no cell to left but has a cell to the right, then it's a clue start
        cell.isStart = true;
        isStartingCell = true;
        cell.clueKey = key;
        cell.xClueNo = key;
      }
    } else {
      //there's an active cell to the left - copy the xClueKey
      const left = this.matrix.getCell({ x: x - 1, y });
      cell.xClueNo = left ? left.xClueNo : null;
    }

    // vertical key check
    if (!this.isActiveCell({ x, y: y - 1 } as Coords)) {
      //no cell above

      if (this.isActiveCell({ x, y: y + 1 } as Coords)) {
        //if there is also a cell below, then this is a clue start
        cell.isStart = true;
        isStartingCell = true;
        cell.clueKey = key;
        cell.yClueNo = key;
      }
    } else {
      //there's an active cell above - copy the yClueKey
      const above = this.matrix.getCell({ x, y: y - 1 });
      cell.yClueNo = above ? above.yClueNo : null;
    }

    //increment at the end so we don't double count starting in both directions for the same cell
    return isStartingCell;
  };

  private setMatrixClues = () => {
    //set the clue keys based on blanks
    let key = 1;

    R.forEach((y) => {
      R.forEach((x) => {
        const coords = { x, y } as Coords;
        const isStartingCell = this.checkCell(
          this.matrix.getCell(coords),
          coords,
          key
        );
        key = isStartingCell ? key + 1 : key;
      }, R.range(0, this.matrix.dimX()));
    }, R.range(0, this.matrix.dimY()));

    console.log(this.matrix);
  };

  private readMatrix(dom: Document): SolutionMatrix {
    const data: Array<Array<Cell>> = [];
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
      data.push(dataRow);
    });

    return new SolutionMatrix(data);
  }

  private readClueGroup(group: Element) {
    const buttons: NodeListOf<Element> = group.querySelectorAll("button");
    const clues: ClueGroupData = {
      keys: function () {
        return R.without(["keys"], Object.keys(this)); //don't include this function in the list
      },
    };

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
