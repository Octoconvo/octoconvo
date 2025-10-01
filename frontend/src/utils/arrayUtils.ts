const removeItemFromArray = <Item>(array: Item[], toDelete: Item): Item[] => {
  const index = array.findIndex((item: Item) => item === toDelete);
  const notFound = index < 0;

  if (notFound) {
    return array;
  }

  const updatedArrays = [...array.slice(0, index), ...array.slice(index + 1)];
  return updatedArrays;
};

export { removeItemFromArray };
