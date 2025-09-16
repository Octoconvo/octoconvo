#!/usr/bin/env node
import { populateFriendsDB } from "./populateFriendsScript";
import { populateMessagesDB } from "./populateMessagesScript";
import { createTimer } from "../utils/timeUtils";
import { populateNotificationsDB } from "./populateNotificationsScript";
import { populateParticipantsDB } from "./populateParticipantsScript";
import { populateCommunitiesDB } from "./populateCommunitiesScript";
import { populateUsersDB } from "./populateUsersScript";
import {
  logPopulateMessage,
  logPopulateSuccessMessage,
} from "../utils/loggerUtils";

type Mode = "COMPACT" | "BALANCED" | "EXTENSIVE";

const mode: Mode = (process.env.SEED_MODE as Mode) || "COMPACT";

const modeSizes = {
  COMPACT: 125,
  BALANCED: 500,
  EXTENSIVE: 1000,
};

// Populate database for testing purposes
const populateDB = async (size: number) => {
  logPopulateMessage("Populating database...");
  const timer = createTimer();
  await populateUsersDB(size);
  await populateCommunitiesDB(size);
  await populateParticipantsDB(size);
  await populateMessagesDB();
  await populateNotificationsDB();
  await populateFriendsDB();
  timer.stopTimer();
  const timeInSecond = timer.timeInSecond;
  logPopulateSuccessMessage("Finished populating database");
  logPopulateSuccessMessage(`${timeInSecond} s`);
};

const size = modeSizes[mode];

populateDB(size);
