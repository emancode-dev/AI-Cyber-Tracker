import net from "node:net";

function ipv4ToNumber(ip) {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return null;
  return (((parts[0] << 24) >>> 0) + (parts[1] << 16) + (parts[2] << 8) + parts[3]) >>> 0;
}

function inCidr4(ipNumber, base, prefix) {
  const baseNumber = ipv4ToNumber(base);
  if (baseNumber === null) return false;
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  return (ipNumber & mask) === (baseNumber & mask);
}

function unsafeIPv4Reason(ip) {
  const value = ipv4ToNumber(ip);
  if (value === null) return "invalid IPv4 address";
  const ranges = [
    ["0.0.0.0", 8, "unspecified/current-network"],
    ["10.0.0.0", 8, "private"],
    ["100.64.0.0", 10, "carrier-grade NAT"],
    ["127.0.0.0", 8, "loopback"],
    ["169.254.0.0", 16, "link-local"],
    ["172.16.0.0", 12, "private"],
    ["192.0.0.0", 24, "reserved"],
    ["192.0.2.0", 24, "documentation"],
    ["192.168.0.0", 16, "private"],
    ["198.18.0.0", 15, "benchmark"],
    ["198.51.100.0", 24, "documentation"],
    ["203.0.113.0", 24, "documentation"],
    ["224.0.0.0", 4, "multicast"],
    ["240.0.0.0", 4, "reserved"]
  ];
  for (const [base, prefix, reason] of ranges) {
    if (inCidr4(value, base, prefix)) return reason;
  }
  return null;
}

function parseIPv6Bytes(rawIp) {
  let ip = rawIp.split("%")[0].toLowerCase();
  if (ip.includes(".")) {
    const lastColon = ip.lastIndexOf(":");
    const ipv4 = ip.slice(lastColon + 1);
    const n = ipv4ToNumber(ipv4);
    if (n === null) return null;
    const high = ((n >>> 16) & 0xffff).toString(16);
    const low = (n & 0xffff).toString(16);
    ip = `${ip.slice(0, lastColon)}:${high}:${low}`;
  }

  const halves = ip.split("::");
  if (halves.length > 2) return null;
  const left = halves[0] ? halves[0].split(":") : [];
  const right = halves.length === 2 && halves[1] ? halves[1].split(":") : [];
  const missing = 8 - left.length - right.length;
  if ((halves.length === 1 && missing !== 0) || missing < 0) return null;
  const groups = halves.length === 2 ? [...left, ...Array(missing).fill("0"), ...right] : left;
  if (groups.length !== 8) return null;

  const bytes = [];
  for (const group of groups) {
    if (!/^[0-9a-f]{1,4}$/i.test(group)) return null;
    const value = Number.parseInt(group, 16);
    bytes.push((value >> 8) & 0xff, value & 0xff);
  }
  return bytes;
}

function inCidr6(bytes, base, prefix) {
  const baseBytes = parseIPv6Bytes(base);
  if (!baseBytes) return false;
  const fullBytes = Math.floor(prefix / 8);
  const remainingBits = prefix % 8;
  for (let index = 0; index < fullBytes; index += 1) {
    if (bytes[index] !== baseBytes[index]) return false;
  }
  if (!remainingBits) return true;
  const mask = (0xff << (8 - remainingBits)) & 0xff;
  return (bytes[fullBytes] & mask) === (baseBytes[fullBytes] & mask);
}

function embeddedIPv4(bytes, offset = 12) {
  return bytes.slice(offset, offset + 4).join(".");
}

function unsafeIPv6Reason(ip) {
  const bytes = parseIPv6Bytes(ip);
  if (!bytes) return "invalid IPv6 address";

  if (bytes.every((byte) => byte === 0)) return "unspecified";
  if (bytes.slice(0, 15).every((byte) => byte === 0) && bytes[15] === 1) return "loopback";

  // IPv4-mapped and deprecated IPv4-compatible encodings are interpreted rather
  // than trusted as ordinary IPv6. This closes alternate-notation SSRF bypasses.
  const mappedPrefix = bytes.slice(0, 10).every((byte) => byte === 0) && bytes[10] === 0xff && bytes[11] === 0xff;
  if (mappedPrefix) return unsafeIPv4Reason(embeddedIPv4(bytes));

  const compatiblePrefix = bytes.slice(0, 12).every((byte) => byte === 0);
  if (compatiblePrefix) return unsafeIPv4Reason(embeddedIPv4(bytes)) || "IPv4-compatible special-purpose";

  // Translation/tunnelling ranges can encode an IPv4 destination. Blocking the
  // special-purpose range avoids letting a public-looking IPv6 literal tunnel to
  // a private/metadata IPv4 target through infrastructure outside our control.
  if (inCidr6(bytes, "64:ff9b::", 96)) return "IPv4/IPv6 translation";
  if (inCidr6(bytes, "64:ff9b:1::", 48)) return "local-use IPv4/IPv6 translation";
  if (inCidr6(bytes, "2001::", 32)) return "Teredo transition";
  if (inCidr6(bytes, "2002::", 16)) return "6to4 transition";

  const specialRanges = [
    ["100::", 64, "discard-only"],
    ["100:0:0:1::", 64, "dummy prefix"],
    ["2001:2::", 48, "benchmark"],
    ["2001:10::", 28, "deprecated ORCHID"],
    ["2001:db8::", 32, "documentation"],
    ["3fff::", 20, "documentation"],
    ["5f00::", 16, "segment-routing special-purpose"],
    ["fc00::", 7, "unique-local"],
    ["fe80::", 10, "link-local"],
    ["fec0::", 10, "deprecated site-local"],
    ["ff00::", 8, "multicast"]
  ];
  for (const [base, prefix, reason] of specialRanges) {
    if (inCidr6(bytes, base, prefix)) return reason;
  }

  return null;
}

export function getUnsafeAddressReason(address) {
  const family = net.isIP(address);
  if (family === 4) return unsafeIPv4Reason(address);
  if (family === 6) return unsafeIPv6Reason(address);
  return "not an IP address";
}

export function isUnsafeAddress(address) {
  return Boolean(getUnsafeAddressReason(address));
}
