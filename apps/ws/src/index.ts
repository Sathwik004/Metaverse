import { WebSocketServer } from 'ws';
import { User } from './user';

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', function connection(ws) {

  ws.on('error', console.error);
  let user = new User(ws);
  console.log(`User connected: ${user.id}`);

  ws.on('message', function message(data) {
    console.log(data)
  });

  ws.on('close', () => {
    user.destroy();
  });

});