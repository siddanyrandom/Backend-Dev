const fs = require("fs");

const ans = `Difference between synchronous and asynchronous file operations:

Synchronous file operations block the execution of the program until
the operation is completed.

Asynchronous file operations do not block execution and use callbacks
to handle the result after completion.
`;

fs.writeFile("q1.txt", ans, "utf8", ((err)=>{
    if(err){
        console.log(err);
    } else {
        console.log("File created with proper answer");
    }
}));
