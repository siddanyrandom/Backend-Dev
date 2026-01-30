const fs = require("fs");

// function for error handling
function handleError(err) {
  if (err.code === "ENOENT") {
    console.log("Error: File or directory not found");
  } else if (err.code === "EACCES") {
    console.log("Error: Permission denied");
  } else {
    console.log("Error:", err.message);
  }
}


// Read a file
fs.readFile("./demo.txt", "utf8", (err, data) => {
  if (err) {
    handleError(err);
  } else {
    console.log("Task completed successfully");
  }
});


// Write a file
fs.writeFile("./demo.txt", "This is the sample data for demo.txt\n", (err) => {
  if (err) {
    handleError(err);
  } else {
    console.log("File created successfully");
  }
});


// Append a file
fs.appendFile("./demo.txt", "This data is for append operation \n Hello Yateesh", (err) => {
  if (err) {
    handleError(err);
  } else {
    console.log("Task completed successfully");
  }
});


// Copy a file
fs.copyFile("./demo.txt", "./copy_of_demo.txt", (err) => {
  if (err) {
    handleError(err);
  } else {
    console.log("Copy created successfully");
  }
});


// Delete a file
fs.unlink("./demo.txt", (err) => {
  if (err) {
    handleError(err);
  } else {
    console.log("File removed successfully");
  }
});


// List files inside a directory
fs.readdir("./", (err, files) => {
  if (err) {
    handleError(err);
  } else {
    console.log("Files in directory:");
    console.log(files);
  }
});
