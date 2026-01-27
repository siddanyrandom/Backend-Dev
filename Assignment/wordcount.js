const fs = require('fs');

const inputFile = 'input.txt';
const outputFile = 'output.txt';

fs.readFile(inputFile, 'utf8', (err, data) => {
    if (err) {
        console.log("Error reading file:", err);
        return;
    }

    const words = data.split(/\s+/).filter(word => word.length > 0);
    const count = words.length;

    fs.writeFile(outputFile, `Word Count: ${count}`, (err) => {
        if (err) {
            console.log("Error writing file:", err);
        } else {
            console.log("Word count written to output.txt");
        }
    });
});
