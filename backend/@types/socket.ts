interface ServerToClientEvents {
  initiate: () => void;
  subscribe: (room: string) => void;
  unsubscribe: (room: string) => void;
}

interface ClientToServerEvents {
  initiate: () => void;
  subscribe: (room: string) => void;
  unsubscribe: (room: string) => void;
}

export { ServerToClientEvents, ClientToServerEvents };
