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

test("blocks IPv6 transition and special-purpose ranges that can bypass private-address checks", () => {
  for (const ip of ["::7f00:1", "64:ff9b::7f00:1", "64:ff9b:1::1", "100::1", "fec0::1", "2001::1", "2002:7f00:1::", "3fff::1", "5f00::1"]) {
    assert.equal(isUnsafeAddress(ip), true, ip);
  }
});

test("allows ordinary global IPv6 addresses", () => {
  assert.equal(isUnsafeAddress("2606:4700:4700::1111"), false);
  assert.equal(isUnsafeAddress("2001:4860:4860::8888"), false);
});
