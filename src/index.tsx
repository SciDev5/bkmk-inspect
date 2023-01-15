import {release} from "./singleton";

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import reportWebVitals from './reportWebVitals';
import { css } from '@emotion/css';

export const rootElt = document.createElement("div");
rootElt.id = "bkmki-root";
rootElt.className = css({
  position: "fixed",
  left: 0,
  top: 0,
  width: 0,
  height: 0,
  zIndex: 9999999,
  color: "#000000",
  "> *": {
    boxSizing: "border-box",
  },
});
document.body.append(rootElt);

const root = ReactDOM.createRoot(
  rootElt
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

export function destroyApp() {
  root.unmount();
  rootElt.remove();
  release();
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
