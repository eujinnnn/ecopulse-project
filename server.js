const http = require('http');
const app = require('./backend/app');
const port = 3000;

app.set('port', port);

const server = http.createServer(app);

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

server.on('error', (error) => {
  console.error('Error occurred while starting the server:', error.message);
});
