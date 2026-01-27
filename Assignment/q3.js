const fs = require("fs");

const ans = `Purpose of the 'utf8' encoding parameter in file operations:

The 'utf8' encoding converts raw binary data into readable text so that
strings are correctly stored and retrieved.

`;

fs.writeFile("q3_ans.txt", ans, "utf8", ((err)=>{
    if(err){
        console.log(err);
    } else {
        console.log("File created with proper answer");
    }
}));
