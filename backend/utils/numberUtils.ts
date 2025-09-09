const isEven = (number: number) => {
  return number % 2 === 0;
};

const getBiggestPowerOfTen = (number: number) => {
  let currentNumber = 1;
  let power = 0;

  while (currentNumber < number) {
    const nextNumber = currentNumber * 10;
    currentNumber = nextNumber;

    if (nextNumber <= number) {
      power += 1;
    }
  }

  return power;
};

const floorNumberToInteger = (number: number) => {
  return Math.floor(number);
};

const getLastIndexToBase10 = (length: number) => {
  const base = Math.pow(10, getBiggestPowerOfTen(length));
  const biggestIntegerDivisor = floorNumberToInteger(length / base);

  return base * biggestIntegerDivisor - 1;
};

export {
  isEven,
  getBiggestPowerOfTen,
  floorNumberToInteger,
  getLastIndexToBase10,
};
