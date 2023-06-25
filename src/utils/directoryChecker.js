const fs = require("fs").promises;
const path = require("path");

const directoryChecker = async (directory) => {
  fs.access(path.resolve(directory))
    .then(() => {
      return;
    })
    .catch((error) => {
      if (error.code === "ENOENT") {
        fs.mkdir(path.resolve(directory), {recursive: true})
          .then(() => {
            return;
          })
          .catch((error) => {
            console.error(`Failed to create folder ${directory}`);
          });
      } else {
        console.error("Error on accessing folder");
      }
    });
};

module.exports = {directoryChecker};
