const fs = require("fs");

const ans = `When should you use file streams instead of reading the entire file:

File streams should be used when dealing with large files so that data
is processed in chunks, reducing memory usage.
`;

fs.writeFile("q2_ans.txt", ans, "utf8", ((err)=>{
    if(err){
        console.log(err);
    } else {
        console.log("File created with proper answer");
    }
}));
