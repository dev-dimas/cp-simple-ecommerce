const app = require('./app');

const host = 'localhost';
const port = 3000;

app.listen(port, host, () => {
  console.log(`Application running on http://${host}:${port}`);
});
