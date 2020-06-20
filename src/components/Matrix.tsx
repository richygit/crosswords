import { Cell, Orientation } from "./Crossword";
import * as R from "ramda";

export interface Coords {
  x: number;
  y: number;
}

export class SolutionMatrix {
  private readonly data: Array<Array<Cell>>;

  constructor(data: Array<Array<Cell>>) {
    this.data = data;
  }

  //returns the cell at the start of the clue which matches the given params
  public findStartCoords = (
    orientation: Orientation | null,
    clueNo: number | null
  ): Coords | null => {
    if (R.isNil(orientation) || R.isNil(clueNo)) {
      return null;
    }

    //TODO figure out how to use this - it gives a weird typescript error
    // const findCell = R.pipe(R.propEq<string>, R.find);

    const clueProp = orientation === Orientation.ACROSS ? "xClueNo" : "yClueNo";

    const found = R.flatten(this.data).find(
      (cell: Cell) => R.prop(clueProp, cell) === clueNo
    );

    if (found) {
      return { x: found.x, y: found.y };
    }
    return null;
  };

  public getCell = (coords: Coords | null): Cell | null => {
    if (R.isNil(coords)) {
      return null;
    }

    if (this.isWithinBounds(coords)) {
      return this.data[coords.y][coords.x];
    }
    return null;
  };

  public isWithinBounds = (coords: Coords): boolean => {
    const lowerBound = R.flip(R.gte)(0);

    return (
      lowerBound(coords.x) &&
      R.lt(coords.x, this.dimX()) &&
      lowerBound(coords.y) &&
      R.lt(coords.y, this.dimY())
    );
  };

  public dimX = (): number => {
    return this.data[0].length;
  };

  public dimY = (): number => {
    return this.data.length;
  };

  private cellsByClue<K extends keyof Cell>(
    start: Coords | null,
    clueNo: number | null,
    clueAttr: K,
    incFn: (c: Coords) => Coords
  ): Array<Cell> | null {
    let cell = this.getCell(start);
    if (R.isNil(cell) || R.isNil(clueNo)) {
      return null;
    }

    const ret = [];
    while (!R.isNil(cell) && R.prop(clueAttr, cell) === clueNo) {
      ret.push(cell);
      cell = this.getCell(incFn(cell));
    }
    return ret;
  }

  // returns the cells for the given selection
  public getClueCells = (
    xClueNo: number | null,
    yClueNo: number | null
  ): Array<Cell> | null => {
    if (R.isNil(xClueNo) && R.isNil(yClueNo)) {
      return null;
    }

    if (R.isNil(yClueNo)) {
      // across
      const start = this.findStartCoords(Orientation.ACROSS, xClueNo);

      //get all cells for the given clue
      return this.cellsByClue(start, xClueNo, "xClueNo", (c) => {
        return { x: c.x + 1, y: c.y };
      });
    } else {
      // down
      const start = this.findStartCoords(Orientation.DOWN, yClueNo);
      return this.cellsByClue(start, yClueNo, "yClueNo", (c) => {
        return { x: c.x, y: c.y + 1 };
      });
    }
  };
}
