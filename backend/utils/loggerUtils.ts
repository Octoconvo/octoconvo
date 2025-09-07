const logPopulateMessage = (message: string) => {
  console.log(`\x1b[36m${message}`);
};

const logUnpopulateMessage = (message: string) => {
  console.log(`\x1b[33m${message}`);
};

export { logPopulateMessage, logUnpopulateMessage };
