const fs = require("fs");

const ans = `How to safely delete a directory with all its contents:

A directory can be safely deleted by removing all its files and
subdirectories recursively with force enabled.
`;

fs.writeFile("q5_ans.txt", ans, "utf8", ((err)=>{
    if(err){
        console.log(err);
    } else {
        console.log("File created with proper answer");
    }
}));
