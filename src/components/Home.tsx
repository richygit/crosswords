import React, { useEffect, useRef, useState } from "react";
import FileUploader from "./FileUploader";
import SmhCrossword, { ClueGroupData } from "../lib/SmhCrossword";
import Crossword from "./Crossword";
import * as R from "ramda";
import { SolutionMatrix } from "./Matrix";
import UrlLoader from "./UrlLoader";

const LZString = require("lz-string/libs/lz-string");

const Home: React.FC = () => {
  const [matrix, setMatrix] = useState<SolutionMatrix | null>(null);
  const [cluesAcross, setCluesAcross] = useState<ClueGroupData | null>(null);
  const [cluesDown, setCluesDown] = useState<ClueGroupData | null>(null);
  const [shareUrl, setShareUrl] = useState<string | undefined>(undefined);
  const [showCopyFlash, setShowCopyFlash] = useState<boolean>(false);
  const shareRef = useRef<HTMLInputElement>(null);

  const url_string = window.location.href;
  const url = new URL(url_string);
  const m = url.searchParams.get("m");
  const a = url.searchParams.get("a");
  const d = url.searchParams.get("d");

  useEffect(() => {
    if (!R.isNil(m) && !R.isNil(a) && !R.isNil(d)) {
      const decodedMatrix = JSON.parse(
        LZString.decompressFromEncodedURIComponent(m)
      );
      const solutionMatrix = SmhCrossword.solutionMatrixFromData(decodedMatrix);
      setMatrix(solutionMatrix);

      const decodedAcross = JSON.parse(
        LZString.decompressFromEncodedURIComponent(a)
      );
      setCluesAcross({ ...decodedAcross, ...SmhCrossword.clueGroupData() });

      const decodedDown = JSON.parse(
        LZString.decompressFromEncodedURIComponent(d)
      );
      setCluesDown({ ...decodedDown, ...SmhCrossword.clueGroupData() });

      setShareUrl(
        `${window.location.href}?${encodeQueryData({
          m,
          a,
          d,
        })}`
      );
    }
  }, [m, a, d]);

  const encodeQueryData = (data: any) => {
    const ret = [];
    for (let d in data)
      if (data.hasOwnProperty(d)) {
        ret.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
      }
    return ret.join("&");
  };

  const onCopyClick = () => {
    if (!R.isNil(shareRef.current)) {
      shareRef.current.select();
      document.execCommand("copy");
      setShowCopyFlash(true);
      window.setTimeout(() => {
        setShowCopyFlash(false);
      }, 5000);
    }
  };

  const onPageLoaded = (pageBody: string) => {
    let parser = new DOMParser();
    let dom = parser.parseFromString(String(pageBody), "text/html");

    const smhCrossword = new SmhCrossword(dom);

    setMatrix(smhCrossword.matrix);
    setCluesAcross(smhCrossword.cluesAcross);
    setCluesDown(smhCrossword.cluesDown);

    const matrixEncoded = LZString.compressToEncodedURIComponent(
      JSON.stringify(smhCrossword.compressedMatrix)
    );

    const acrossEncoded = LZString.compressToEncodedURIComponent(
      JSON.stringify(smhCrossword.cluesAcross)
    );

    const downEncoded = LZString.compressToEncodedURIComponent(
      JSON.stringify(smhCrossword.cluesDown)
    );

    setShareUrl(
      `${window.location.href}?${encodeQueryData({
        m: matrixEncoded,
        a: acrossEncoded,
        d: downEncoded,
      })}`
    );
  };

  // otherwise show upload area
  if (!R.isNil(matrix) && !R.isNil(cluesAcross) && !R.isNil(cluesDown)) {
    return (
      <>
        <div className="__share">
          <input
            ref={shareRef}
            type="text"
            disabled={undefined}
            defaultValue={shareUrl}
          />
          <button onClick={onCopyClick}>Share!</button>
          {showCopyFlash && (
            <span style={{ background: "#fbff00" }}>Link Copied!</span>
          )}
        </div>
        <Crossword
          matrix={matrix}
          cluesAcross={cluesAcross}
          cluesDown={cluesDown}
        />
      </>
    );
  } else {
    return (
      <>
        <UrlLoader onPageLoaded={onPageLoaded} />
        <FileUploader onPageLoaded={onPageLoaded} />
      </>
    );
  }
};
export default Home;
