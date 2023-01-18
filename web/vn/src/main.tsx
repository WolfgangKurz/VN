import { render } from "preact";

import "./config";

import App from "./app";
import { StartupScript } from "./debug";

import "./index.scss";

StartupScript();
render(<App />, document.getElementById("app") as HTMLElement);
