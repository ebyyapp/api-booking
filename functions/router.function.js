const fs = require("fs");
const path = require("path");

const fromDir = (startPath, filter) => {
  let arrayRoutes = [];
  if (!fs.existsSync(startPath)) {
    return arrayRoutes;
  }

  let files = fs.readdirSync(startPath);
  
  files.forEach((file) => {
    let filename = path.join(startPath, file);
    let stat = fs.lstatSync(filename);
    if (stat.isDirectory()) {
      arrayRoutes = arrayRoutes.concat(fromDir(filename, filter)); //recurse
    } else if (
      file.indexOf(".") !== 0 &&
      file.slice(-3) === filter
    ) {
      arrayRoutes.push(filename);
    }
  });
  return arrayRoutes;
};

module.exports = {
  fromDir
};