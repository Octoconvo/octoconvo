import { Socket } from "socket.io-client";

const onConnect = () => {
  console.log(
    `%cSuccessfully established a socket connection`,
    `color: #6cc417;`
  );
};

const connectToRoom = (socket: Socket, room: string) => {
  socket.emit("subscribe", room);
};

export { onConnect, connectToRoom };
