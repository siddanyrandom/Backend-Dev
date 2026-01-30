const fs = require("fs");

const ans = `Difference between writeFile and appendFile methods:

writeFile overwrites the existing file content.
appendFile adds new data to the end of the file.
`;

fs.writeFile("q8_ans.txt", ans, "utf8", ((err)=>{
    if(err){
        console.log(err);
    } else {
        console.log("File created ");
    }
}));
