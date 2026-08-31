import { runPassiveScanner } from "../scanner/scannerRunner.js";

if (process.env.SCANNER_CONFIRM_AUTHORIZED !== "true") {
  console.error("Refusing to scan. Set SCANNER_CONFIRM_AUTHORIZED=true only for a website you own or are explicitly authorized to assess.");
  process.exit(1);
}

const target = process.env.SCANNER_TEST_URL;
if (!target) {
  console.error("SCANNER_TEST_URL is required.");
  process.exit(1);
}

try {
  const result = await runPassiveScanner(target);
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error(JSON.stringify({ error: error.code || error.name, message: error.message, details: error.details || null }, null, 2));
  process.exit(1);
}
