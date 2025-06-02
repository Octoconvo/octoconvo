import UserValue from "../user";

declare global {
  namespace Express {
    // eslint-disable-next-line
    interface User extends UserValue {}
    interface Request {
      user?: UserValue;
    }
  }
}
