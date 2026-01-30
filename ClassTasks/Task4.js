const os = require("os");
const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "system-log.txt");

setInterval(() => {
  fs.appendFile(
    file,
    JSON.stringify({
      time: new Date(),     
      cpu: os.cpus().length,     
      freeMem: os.freemem(),    
      totalMem: os.totalmem(),    
      platform: os.platform()     
    }) + "\n",
    () => {}
  );
}, 5000);
