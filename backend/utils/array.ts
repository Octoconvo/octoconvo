const getLastItemInTheArray = <Item>(array: Item[]): Item | undefined => {
  return array[array.length - 1];
};

export { getLastItemInTheArray };
