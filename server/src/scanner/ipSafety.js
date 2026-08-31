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

function unsafeIPv6Reason(ip) {
  const bytes = parseIPv6Bytes(ip);
  if (!bytes) return "invalid IPv6 address";
  if (bytes.every((byte) => byte === 0)) return "unspecified";
  if (bytes.slice(0, 15).every((byte) => byte === 0) && bytes[15] === 1) return "loopback";
  if ((bytes[0] & 0xfe) === 0xfc) return "unique-local";
  if (bytes[0] === 0xfe && (bytes[1] & 0xc0) === 0x80) return "link-local";
  if (bytes[0] === 0xff) return "multicast";
  if (bytes[0] === 0x20 && bytes[1] === 0x01 && bytes[2] === 0x0d && bytes[3] === 0xb8) return "documentation";

  const mappedPrefix = bytes.slice(0, 10).every((byte) => byte === 0) && bytes[10] === 0xff && bytes[11] === 0xff;
  if (mappedPrefix) {
    const mapped = bytes.slice(12).join(".");
    return unsafeIPv4Reason(mapped);
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
