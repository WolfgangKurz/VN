/// <reference types="vite/client" />

import JSX = preact.JSX;
import VNode = preact.VNode;
import Component = preact.Component;
import FunctionalComponent = preact.FunctionalComponent;

interface ImportMetaEnv {
	readonly VERSION: Record<string, string>;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
