const getLastItemInTheArray = <Item>(array: Item[]): Item | undefined => {
  return array[array.length - 1];
};

const pushEmptyArray = <Type>(array: Type[][]) => {
  array.push([]);
};

const isArrayIndexUndefined = <Type>(array: Type[], index: number): boolean => {
  return array[index] === undefined;
};

const breakArrayIntoSubArrays = <Type>({
  array,
  subArraySize,
}: {
  array: Type[];
  subArraySize: number;
}) => {
  const arrayCopy = array;
  const subArray: Type[][] = [];

  let subArrayIndex = 0;

  for (let i = 0; i < arrayCopy.length; i++) {
    if (isArrayIndexUndefined(subArray, subArrayIndex)) {
      pushEmptyArray(subArray);
    }

    subArray[subArrayIndex].push(arrayCopy[i]);

    if (subArray[subArrayIndex].length === subArraySize) {
      subArrayIndex++;
    }
  }

  return subArray;
};

export { getLastItemInTheArray, breakArrayIntoSubArrays };
