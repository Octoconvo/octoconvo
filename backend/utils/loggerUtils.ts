import pino from "pino";

const NODE_ENV = process.env.NODE_ENV;
const isDev = NODE_ENV?.toLowerCase() == "development";

const logger = pino(
  isDev
    ? {
        transport: {
          target: "pino-pretty",
          options: {
            colorarize: true,
          },
        },
      }
    : {},
);

const ANSI = {
  lightGreen: `\x1b[38:5:190m`,
  green: `\x1b[38:5:119m`,
  orange: `\x1b[38:5:208m`,
  brightRed: `\x1b[38:5:196m`,
  red: `\x1b[38:5:160m`,
  reset: `\x1b[0m`,
  bold: `\x1b[1m`,
};

const logPopulateMessage = (message: string) => {
  logger.info(`${ANSI.lightGreen}${message}${ANSI.reset}`);
};

const logPopulateSuccessMessage = (message: string) => {
  logger.info(`${ANSI.green}${ANSI.bold}${message}${ANSI.reset}`);
};

const logUnpopulateMessage = (message: string) => {
  logger.info(`${ANSI.orange}${message}${ANSI.reset}`);
};

const logUnpopulateSuccessMessage = (message: string) => {
  logger.info(`${ANSI.brightRed}${ANSI.bold}${message}${ANSI.reset}`);
};

const logErrorMessage = (
  // eslint-disable-next-line
  error: any,
) => {
  if (error instanceof Error) {
    logger.error(`${ANSI.red}${ANSI.bold}${error.message}${ANSI.reset}`);
  }
};

export {
  logPopulateMessage,
  logUnpopulateMessage,
  logUnpopulateSuccessMessage,
  logPopulateSuccessMessage,
  logErrorMessage,
};
