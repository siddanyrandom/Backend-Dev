const fs = require("fs");

const ans = `Common error codes in file system operations and their meaning:

ENOENT  - File or directory does not exist  
EACCES  - Permission denied  
EISDIR  - Path refers to a directory   
`;

fs.writeFile("q4_ans.txt", ans, "utf8", ((err)=>{
    if(err){
        console.log(err);
    } else {
        console.log("File created with proper answer");
    }
}));
