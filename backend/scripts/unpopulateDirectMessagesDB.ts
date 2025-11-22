import { DirectMessage } from "@prisma/client";
import {
  logErrorMessage,
  logUnpopulateMessage,
  logUnpopulateSuccessMessage,
} from "../utils/loggerUtils";
import {
  deleteDirectMessageAndItsData,
  getSeedDirectMessages,
} from "../database/prisma/scriptQueries";

const destroyDirectMessage = async (DM: DirectMessage): Promise<void> => {
  try {
    logUnpopulateMessage(`Deleting direct message with id ${DM.id}`);
    await deleteDirectMessageAndItsData(DM.id);
    logUnpopulateSuccessMessage(
      `Successfully deleted direct message with id ${DM.id}`,
    );
  } catch (err) {
    logErrorMessage(err);
  }
};

const unpopulateDirectMessages = async (
  DMs: DirectMessage[],
): Promise<void> => {
  for (const DM of DMs) {
    await destroyDirectMessage(DM);
  }
};

const unpopulateDirectMessagesDB = async (): Promise<void> => {
  try {
    const seedDirectMessages: DirectMessage[] = await getSeedDirectMessages();

    await unpopulateDirectMessages(seedDirectMessages);
  } catch (err) {
    logErrorMessage(err);
  }
};

unpopulateDirectMessagesDB();
