const fs = require("fs");

const ans = `Why is it important to handle errors in file operations:

Error handling prevents application crashes and helps manage runtime
issues such as missing files or permission problems.
`;

fs.writeFile("q7_ans.txt", ans, "utf8", ((err)=>{
    if(err){
        console.log(err);
    } else {
        console.log("File created ");
    }
}));
