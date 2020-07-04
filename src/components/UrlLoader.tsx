import React, { useRef, useState } from "react";
import * as R from "ramda";

interface Props {
  onPageLoaded: (s: string) => void;
}

const UrlLoader: React.FC<Props> = ({ onPageLoaded }) => {
  const urlField = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [attempts, setAttempts] = useState<number>(0);

  const proxyUrl = atob(
    "aHR0cHM6Ly92YXN0LWxvd2xhbmRzLTQ5MzE2Lmhlcm9rdWFwcC5jb20v"
  );

  async function loadUrl(targetUrl: string) {
    const url = proxyUrl + targetUrl;
    const headers = new Headers({
      "X-Requested-With": "XMLHttpRequest",
    });
    const request = new Request(url, {
      method: "GET",
      headers: headers,
    });
    const response = await fetch(request);
    const textBody = await response.text();
    console.log("text body:", textBody);
    return textBody;
  }

  const loadAttempt = (url: string): void => {
    if (loading) {
      return;
    }

    console.log("attemping to load: ", url);
    setLoading(true);
    setAttempts((prev) => prev + 1);

    loadUrl(url)
      .then((pageBody) => {
        onPageLoaded(pageBody);
        setLoading(false);
      })
      .catch((reason) => {
        //try again
        setLoading(false);

        setTimeout(() => {
          if (attempts < 3) {
            loadAttempt(url);
          }
        }, 3000);
      });
  };

  const onClick = () => {
    if (R.isNil(urlField) || R.isNil(urlField.current)) {
      return;
    }

    const url = urlField.current.value;
    loadAttempt(url);
  };

  return (
    <h1>
      <input ref={urlField} type="text" />
      <button onClick={onClick}>Load</button>
      {loading && <span>loading...</span>}
    </h1>
  );
};
export default UrlLoader;
