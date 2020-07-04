import {
  Dispatch,
  Reducer,
  SetStateAction,
  useEffect,
  useReducer,
  useState,
} from "react";
import * as R from "ramda";

const PROXY_URL = atob(
  "aHR0cHM6Ly92YXN0LWxvd2xhbmRzLTQ5MzE2Lmhlcm9rdWFwcC5jb20v"
);

interface State {
  // value: number;
  loading: boolean;
  error: string | undefined;
  pageBody: string | undefined;
}

type Action =
  | { type: "FETCH_LOADING" }
  | { type: "FETCH_COMPLETED"; pageBody: string }
  | { type: "FETCH_ERROR"; error: string };

const counterReducer = (state: State, action: Action) => {
  switch (action.type) {
    case "FETCH_LOADING":
      return { ...state, loading: true, error: undefined };
    case "FETCH_COMPLETED":
      return { ...state, loading: false, pageBody: action.pageBody };
    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.error };
    default:
      throw new Error();
  }
};

const useFetchCrossword = (): [
  { pageBody: string | undefined; loading: boolean; error: string | undefined },
  (s: string | undefined) => void
] => {
  const [url, setUrl] = useState<string | undefined>();
  const [state, dispatch] = useReducer(counterReducer, {
    loading: false,
    error: undefined,
    pageBody: undefined,
  });

  useEffect(() => {
    let didCancel = false;

    async function loadUrl(targetUrl: string) {
      try {
        //watch for cancellation. If cancelled, don't update state (however fetch request is still performed).
        dispatch({ type: "FETCH_LOADING" });
        const response = await fetch(buildRequest(PROXY_URL + targetUrl));

        if (!response.ok) {
          throw Error("Fetch response not ok.");
        }

        if (!didCancel) {
          dispatch({
            type: "FETCH_COMPLETED",
            pageBody: await response.text(),
          });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: "FETCH_ERROR", error });
        }
      }
    }

    if (!R.isNil(url)) {
      loadUrl(url);
    }

    return () => {
      didCancel = true;
    };
  }, [url]);

  const buildRequest = (url: string) => {
    const headers = new Headers({
      "X-Requested-With": "XMLHttpRequest",
    });

    return new Request(url, {
      method: "GET",
      headers: headers,
    });
  };

  return [state, setUrl];
};

export default useFetchCrossword;
