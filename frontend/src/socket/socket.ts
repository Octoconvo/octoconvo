import { io } from "socket.io-client";

const URL = process.env.NEXT_PUBLIC_DOMAIN_URL;

const socket = io(URL, {
  withCredentials: true,
  autoConnect: false,
});

socket.on("connect", () => {
  console.log(
    `%cSuccessfully established a socket connection.`,
    `color: #6cc417;`
  );
});

export default socket;
