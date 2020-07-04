import React, { FormEvent, useEffect, useRef, useState } from "react";
import * as R from "ramda";
import useFetchCrossword from "./useFetchCrossword";

interface Props {
  onPageLoaded: (s: string) => void;
}

const UrlLoader: React.FC<Props> = ({ onPageLoaded }) => {
  const urlField = useRef<HTMLInputElement>(null);
  const [{ pageBody, loading, error }, fetchCrossword] = useFetchCrossword();

  useEffect(() => {
    if (!R.isNil(pageBody)) {
      onPageLoaded(pageBody);
    }
  }, [onPageLoaded, pageBody]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (R.isNil(urlField) || R.isNil(urlField.current)) {
      return;
    }

    fetchCrossword(urlField.current.value);
  };

  return (
    <h1>
      {error && <span>Something went wrong. Please try again.</span>}
      <form onSubmit={onSubmit}>
        <input ref={urlField} type="text" />
        <button type="submit" disabled={loading}>
          Load
        </button>
      </form>
      {loading && <span>loading...</span>}
    </h1>
  );
};

export default UrlLoader;
