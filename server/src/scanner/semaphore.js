import { env } from "../config/env.js";
import { HttpError } from "../utils/HttpError.js";

let active = 0;
const waiters = [];

function release() {
  active = Math.max(0, active - 1);
  const next = waiters.shift();
  if (next) next();
}

export async function withScannerSlot(work) {
  if (active >= env.scannerMaxConcurrent) {
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        const index = waiters.indexOf(wake);
        if (index >= 0) waiters.splice(index, 1);
        reject(new HttpError(503, "The scanner is busy. Try again shortly.", "SCANNER_CAPACITY_BUSY"));
      }, env.scannerQueueTimeoutMs);
      const wake = () => { clearTimeout(timer); resolve(); };
      waiters.push(wake);
    });
  }
  active += 1;
  try { return await work(); }
  finally { release(); }
}

export function scannerConcurrencyForTests() {
  return { active, queued: waiters.length };
}
