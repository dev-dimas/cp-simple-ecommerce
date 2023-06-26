const {server} = require("./server");
const path = require("path");
const {directoryChecker} = require("./utils/directoryChecker");

const publicPath = [
  path.resolve("public/shops/avatar"),
  path.resolve("public/users/avatar"),
  path.resolve("public/products"),
];
publicPath.forEach(async (directory) => {
  await directoryChecker(directory);
});

const app = server();
const port = 3000;

app.listen(port);
console.log(`Application running on port ${port}`);
