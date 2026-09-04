import "server-only";

import * as PDFLib from "pdf-lib";
import { configure, lock } from "pdf-lib-encrypt";

// Configure pdf-lib-encrypt once at module level.
// Both generate.tsx and the download route import from here,
// so configure() is called exactly once regardless of Turbopack's bundling.
configure(PDFLib);

export { lock };