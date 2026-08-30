import test from "node:test";
import assert from "node:assert/strict";
import { isUnsafeAddress } from "../src/scanner/ipSafety.js";

test("blocks common private/loopback IP ranges", () => {
  for (const ip of ["127.0.0.1", "10.0.0.1", "172.16.1.2", "192.168.1.1", "169.254.169.254", "::1", "fc00::1", "fe80::1"]) {
    assert.equal(isUnsafeAddress(ip), true, ip);
  }
});

test("allows ordinary public addresses", () => {
  assert.equal(isUnsafeAddress("8.8.8.8"), false);
  assert.equal(isUnsafeAddress("1.1.1.1"), false);
});
