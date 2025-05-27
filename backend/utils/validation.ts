const isUUID = (value: string): boolean => {
  const regex = new RegExp(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/,
  );

  return regex.test(value);
};

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

export { isUUID, isISOString };
