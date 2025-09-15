import { populateParticipantsDB } from "./populateParticipantsScript";
type Mode = "COMPACT" | "BALANCED" | "EXTENSIVE";

const mode: Mode = (process.env.SEED_MODE as Mode) || "COMPACT";

const modeSizes = {
  COMPACT: 125,
  BALANCED: 500,
  EXTENSIVE: 1000,
};

const size = modeSizes[mode];

populateParticipantsDB(size);
