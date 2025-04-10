const http = require('http');
const app = require('./app');
const {port} = require('./config/keys');

//  create a server using the express app
const server = http.createServer(app);

// listen on the specified port
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});