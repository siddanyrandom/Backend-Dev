
const fs = require("fs").promises;
const path = require("path");
const SRC = path.join(__dirname, "uploads");
const BACKUP = path.join(__dirname, "backup");
const LOG = path.join(__dirname, "backup.log");
const LIMIT = 7 * 24 * 60 * 60 * 1000;   // Time limit: 7 days in milliseconds

// function to write logs with timestamp
const log = (message) => {
  return fs.appendFile(LOG, `[${new Date().toISOString()}] ${message}\n`);
};

async function run() {
  try {
    await fs.access(SRC);    // Check if source directory exists
    await fs.mkdir(BACKUP, { recursive: true });    // Create backup directory if it does not exist

    const files = await fs.readdir(SRC);

    for (const file of files) {
      const filePath = path.join(SRC, file);
      const stats = await fs.stat(filePath);

      if (!stats.isFile()) continue;
      const backupPath = path.join(BACKUP, `${Date.now()}_${file}`);
      await fs.copyFile(filePath, backupPath);
      await log(`BACKUP: ${file}`);

      if (Date.now() - stats.mtimeMs > LIMIT) {    // Delete file if it is older than 7 days
        await fs.unlink(filePath);
        await log(`DELETE: ${file}`);
      }
    }
  } catch (error) {
    await log(`ERROR: ${error.message}`);
  }
}

run();
