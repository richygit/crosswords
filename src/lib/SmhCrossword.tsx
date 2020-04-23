class SmhCrossword {
  public matrix: Array<Array<String | null>>;
  public cluesAcross: any;
  public cluesDown: any;
  constructor(dom: Document) {
    this.matrix = this.readMatrix(dom);
    const [across, down] = this.readClues(dom);
    this.cluesAcross = across; //{ref -> [clue, letter count]}
    this.cluesDown = down;

    // window.dom = dom;
  }

  readMatrix(dom: Document): Array<Array<String | null>> {
    const matrix: Array<Array<String | null>> = [];
    const rows = dom.querySelectorAll("#crossword table.printOnly tr");
    Array.from(rows).forEach((tr) => {
      const dataRow: Array<String | null> = [];
      const cells = tr.querySelectorAll("td");
      Array.from(cells).forEach((td) => {
        dataRow.push(td.textContent);
      });
      matrix.push(dataRow);
    });

    return matrix;
  }

  readClueGroup(group: Element) {
    const buttons: NodeListOf<Element> = group.querySelectorAll("button");
    const clues: any = {};

    Array.from(buttons).forEach((btn) => {
      const ref = btn.getAttribute("data-position");
      if (ref === null) {
        throw new Error(`Unable to read clue position: ${btn}`);
      }
      const clueText = btn.querySelector("span:last-child")!.textContent;
      const sep = clueText!.lastIndexOf("(");
      if (sep >= 0) {
        const text = clueText!.slice(0, sep).trim();
        const len = clueText!.slice(sep, -1).replace(/[^\d]/g, "");
        clues[ref] = [text, len];
      } else {
        clues[ref] = [clueText, -1];
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
