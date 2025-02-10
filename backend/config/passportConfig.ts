import { getUserByUsername, getUserById } from "../database/prisma/userQueries";
import bcrypt from "bcrypt";
import { VerifyFunction } from "passport-local";
import passport from "passport";
import passportLocal from "passport-local";

const strategy: VerifyFunction = async (username, password, done) => {
  const message = "Incorrect username or password.";

  try {
    const user = await getUserByUsername(username);

    // Send a response if the user doesn't exist.
    if (!user) {
      return done(null, false, { message });
    }

    // Check whether entered password match user password
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return done(null, false, { message });
    }

    return done(null, user);
  } catch (err) {
    return done(err);
  }
};

const LocalStrategy = passportLocal.Strategy;

passport.use(new LocalStrategy(strategy));
passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await getUserById(id);

    done(null, user);
  } catch (err) {
    done(err);
  }
});

export default passport;
