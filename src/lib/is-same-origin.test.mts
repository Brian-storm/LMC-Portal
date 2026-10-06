import assert from "node:assert/strict";
import test from "node:test";

import { isSameOriginRequest } from "./is-same-origin";

test("isSameOriginRequest accepts the configured origin regardless of URL path", () => {
  // 1: The request origin and configured public origin share scheme, host, and port.
  assert.equal(
    isSameOriginRequest("https://portal.example.test", "https://portal.example.test/admin"),
    true,
  );
});

test("isSameOriginRequest rejects missing, malformed, and cross-origin headers", () => {
  // 1: Cross-site POSTs and unconfigured deployments fail closed.
  assert.equal(isSameOriginRequest("https://attacker.example.test", "https://portal.example.test"), false);
  assert.equal(isSameOriginRequest(null, "https://portal.example.test"), false);
  assert.equal(isSameOriginRequest("not a URL", "https://portal.example.test"), false);
  assert.equal(isSameOriginRequest("https://portal.example.test", undefined), false);
});
