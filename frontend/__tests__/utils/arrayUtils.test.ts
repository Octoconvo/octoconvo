import { removeItemFromArray } from "@/utils/arrayUtils";

const arrayMock = [1, 2, 3, 4, 5, 6, 7, 8, 9];

describe("Test removeItemFromArray", () => {
  test("removeItemFromArray should remove 9 from the array", () => {
    const array = removeItemFromArray<number>(arrayMock, 9);
    expect(array).toStrictEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  test("removeItemFromArray should remove 1 from the array", () => {
    const array = removeItemFromArray<number>(arrayMock, 1);
    expect(array).toStrictEqual([2, 3, 4, 5, 6, 7, 8, 9]);
  });

  test("removeItemFromArray should remove 3 from the array", () => {
    const array = removeItemFromArray<number>(arrayMock, 3);
    expect(array).toStrictEqual([1, 2, 4, 5, 6, 7, 8, 9]);
  });

  test("removeItemFromArray should not mutate the original array", () => {
    removeItemFromArray<number>(arrayMock, 9);
    expect(arrayMock).toStrictEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  test(
    "removeItemFromArray return the original array if the toDelete item is" +
      " not in the array",
    () => {
      const array = removeItemFromArray<number>(arrayMock, 10);
      expect(arrayMock).toStrictEqual(array);
    }
  );
});
