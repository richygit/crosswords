import { Cell } from "./Crossword";
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
}

export class AnswerMatrix {
  private readonly matrix: Array<Array<string | null>>;

  constructor(source: SolutionMatrix) {
    this.matrix = R.range(0, source.dimY()).map((row) => Array(source.dimX()));
  }
}
