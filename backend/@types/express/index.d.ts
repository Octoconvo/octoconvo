import UserValue from "../user";
import {
  User as PrismaUser,
  Notification as PrismaNotification,
} from "@prisma/client";

type Profile = Omit<PrismaUser, "password", "isDeleted">;

declare global {
  namespace Express {
    // eslint-disable-next-line
    interface User extends UserValue {}
    interface Request {
      user?: UserValue;
      friend?: Profile;
      notification?: PrismaNotification;
    }
  }
}
