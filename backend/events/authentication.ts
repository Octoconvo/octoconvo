import { EventEmitter } from "node:events";
import debugFn from "debug";
const debug = debugFn("backend:server");

class emitter extends EventEmitter {
  constructor() {
    super();
  }

  login({ user, date }: { user: Express.User; date: Date }) {
    this.emit("login", { user, date });
  }
}

const AuthenticationEmitter = new emitter();

AuthenticationEmitter.on(
  "login",
  ({ user, date }: { user: Express.User; date: Date }) => {
    debug(`${user.username} sucessfully logged in at ${date}`);
  },
);

export default AuthenticationEmitter;
