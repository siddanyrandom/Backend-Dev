
const fs = require("fs");
const readline = require("readline");

const logFilePath = "server.log";
const reportFilePath = "summary_report.txt";

// Counters
let totalLines = 0;
let errorCount = 0;
let warningCount = 0;
let infoCount = 0;

const stream = fs.createReadStream(logFilePath);

// readline interface to make system for line by line reading
const rl = readline.createInterface({
  input: stream,
  crlfDelay: Infinity
});

// Read file line by line
rl.on("line", (line) => {
  totalLines++;

  if (line.includes("ERROR")) errorCount++;
  else if (line.includes("WARNING")) warningCount++;
  else if (line.includes("INFO")) infoCount++;
});


rl.on("close", () => {
  const report = `
Log File Analysis Report :-
Total Lines   : ${totalLines}
ERROR Count   : ${errorCount}
WARNING Count : ${warningCount}
INFO Count    : ${infoCount}
`;

  fs.writeFile(reportFilePath, report, (err) => {
    if (err) {
      console.error("Error writing report:", err);
    } else {
      console.log("Summary report generated successfully.");
    }
  });
});
