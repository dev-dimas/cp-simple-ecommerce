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
const host = "localhost";
const port = 3000;

app.listen(port, host, () => {
  console.log(`Application running on http://${host}:${port}`);
});
