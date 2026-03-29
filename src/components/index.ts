import { PretextLine } from "./PretextLine.js";
import { PretextLines } from "./PretextLines.js";
import { PretextProvider } from "./PretextProvider.js";
import { PretextRoot } from "./PretextRoot.js";

export const Pretext = {
	Root: PretextRoot,
	Lines: PretextLines,
	Line: PretextLine,
	Provider: PretextProvider,
} as const;

export { PretextRoot } from "./PretextRoot.js";
export { PretextLines } from "./PretextLines.js";
export { PretextLine } from "./PretextLine.js";
export { PretextProvider } from "./PretextProvider.js";
