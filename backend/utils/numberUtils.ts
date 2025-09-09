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

export { isEven, getBiggestPowerOfTen, floorNumberToInteger };
