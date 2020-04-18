class SmhCrossword {
  constructor(dom) {
    this.matrix = this.readMatrix(dom);
    const [across, down] = this.readClues(dom);
    this.cluesAcross = across; //{ref -> [clue, letter count]}
    this.cluesDown = down;

    //FIXME testing only below
    window.dom = dom;
  }

  readMatrix(dom) {
    const matrix = [];
    const rows = dom.querySelectorAll("#crossword table.printOnly tr");
    Array.from(rows).forEach((tr) => {
      const dataRow = [];
      const cells = tr.querySelectorAll("td");
      Array.from(cells).forEach((td) => {
        dataRow.push(td.textContent);
      });
      matrix.push(dataRow);
    });

    return matrix;
  }

  readClueGroup(group) {
    const buttons = group.querySelectorAll("button");
    const clues = {};

    Array.from(buttons).forEach((btn) => {
      const ref = btn.getAttribute("data-position");
      const clueText = btn.querySelector("span:last-child").textContent;
      const sep = clueText.lastIndexOf("(");
      if (sep >= 0) {
        const text = clueText.slice(0, sep).trim();
        const len = clueText.slice(sep, -1).replace(/[^\d]/g, "");
        clues[ref] = [text, len];
      } else {
        clues[ref] = [clueText, -1];
      }
    });

    return clues;
  }

  readClues(dom) {
    const groups = Array.from(dom.querySelectorAll("#crossword-clues > div"));
    const acrossIdx = groups.findIndex(
      (group) =>
        group
          .querySelector("div:first-child")
          .textContent.trim()
          .toLowerCase() === "across"
    );
    if (acrossIdx < 0) {
      console.error("Unable to identify across and down clue groups.");
      return [null, null];
    }
    const across = groups.splice(acrossIdx, 1)[0];
    const down = groups.pop();

    return [this.readClueGroup(across), this.readClueGroup(down)];
  }
}

export default SmhCrossword;
