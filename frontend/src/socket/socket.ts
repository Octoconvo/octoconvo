import { io } from "socket.io-client";
import { onConnect } from "./eventHandler";

const URL = process.env.NEXT_PUBLIC_DOMAIN_URL;

const socket = io(URL, {
  withCredentials: true,
  autoConnect: false,
});

socket.on("connect", onConnect);

export default socket;
