const logPopulateMessage = (message: string) => {
  console.log(`\x1b[36m${message}`);
};

const logUnpopulateMessage = (message: string) => {
  console.log(`\x1b[33m${message}`);
};

const logUnpopulateSuccessMessage = (message: string) => {
  console.log(`\x1b[31m[${message}`);
};

export {
  logPopulateMessage,
  logUnpopulateMessage,
  logUnpopulateSuccessMessage,
};
