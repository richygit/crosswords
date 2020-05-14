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

    const prop = orientation === Orientation.ACROSS ? "xClueNo" : "yClueNo";

    const found = R.flatten(this.data).find(
      (cell: Cell) => cell[prop] === clueNo
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

  // returns the cells for the given selection
  public getClueCells = (
    xClueNo: number | null,
    yClueNo: number | null
  ): Array<Cell> | null => {
    if (R.isNil(xClueNo) && R.isNil(yClueNo)) {
      return null;
    }

    const cellsByClue = (
      start: Coords | null,
      incFn: (c: Coords) => Coords
    ): Array<Cell> | null => {
      let cell = this.getCell(start);
      if (R.isNil(cell)) {
        return null;
      }

      const ret = [];
      while (cell?.xClueNo === xClueNo) {
        ret.push(cell);
        cell = this.getCell(incFn(cell));
      }
      return ret;
    };

    if (R.isNil(yClueNo)) {
      // across
      const start = this.findStartCoords(Orientation.ACROSS, xClueNo);
      return cellsByClue(start, (c) => {
        return { x: c.x + 1, y: c.y };
      });
    } else {
      // down
      const start = this.findStartCoords(Orientation.DOWN, yClueNo);
      return cellsByClue(start, (c) => {
        return { x: c.x, y: c.y + 1 };
      });
    }
  };
}

export class AnswerMatrix {
  private readonly matrix: Array<Array<string | null>>;

  constructor(source: SolutionMatrix) {
    this.matrix = R.range(0, source.dimY()).map((row) => Array(source.dimX()));
  }
}
