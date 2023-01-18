import NodePATH from "node:path";

// 1x1 transparent gif
export const TRANSPARENT = "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";

export const __dirname = (window.nw.require("path") as typeof NodePATH).resolve();
