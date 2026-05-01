const fs = require('fs');

fs.readFile('input.txt', 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading file:', err.message);
        return;
    }

    console.log("File successfully read");

    const lines = data.trim().split('\n').length;
    const words = data.trim().split(/\s+/).length;

    const result = `Total Lines: ${lines}\nTotal Words: ${words}`;

    fs.writeFile('output.txt', result, (err) => {
        if (err) {
            console.error('Error writing file:', err.message);
            return;
        }
        console.log('Output written successfully');
    });
});
