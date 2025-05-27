const isISOString = (value: string) => {
  try {
    const date = new Date(value);

    return !Number.isNaN(date.valueOf) && date.toISOString() === value;
  } catch (
    //eslint-disable-next-line
    err
  ) {
    return false;
  }
};

export { isISOString };
