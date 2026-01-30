const fs = require("fs");

const ans = `Concept of piping in streams with an example:

Piping is used to transfer data directly from a readable stream to a
writable stream without storing the entire data in memory.

`;

fs.writeFile("q6_ans.txt", ans, "utf8", ((err)=>{
    if(err){
        console.log(err);
    } else {
        console.log("File created ");
    }
}));
