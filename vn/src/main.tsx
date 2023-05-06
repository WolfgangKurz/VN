import { render } from "preact";

import "./config";
import GlobalStorage from "./libs/GlobalStorage";

import App from "./app";
import { StartupScript } from "./startup";

import "./index.scss";

GlobalStorage.Instance.Read();
StartupScript();

render(<App />, document.getElementById("app") as HTMLElement);
