import { render } from "preact";

import "./config";
import GlobalStorage from "./libs/GlobalStorage";

import App from "./app";
import { StartupScript } from "./debug";

import "./index.scss";

StartupScript();
GlobalStorage.Instance.Read();

render(<App />, document.getElementById("app") as HTMLElement);
