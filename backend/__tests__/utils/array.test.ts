import {
  breakArrayIntoSubArrays,
  getLastItemInTheArray,
} from "../../utils/array";
import { generateArrayOfInts } from "../../utils/testUtils";

describe("Test getLastItemInTheArray function", () => {
  test("return undefined when the array is empy", () => {
    const lastItem = getLastItemInTheArray([]);

    expect(lastItem).toBe(undefined);
  });

  test("Return the last item if array is not empty", () => {
    const lastItem = getLastItemInTheArray<string>(["a", "b", "c"]);

    expect(lastItem).toBe("c");
  });
});

describe("Test breakArrayIntoSubarrays function", () => {
  test("Return an array that contains 2 arrays with 10 items", () => {
    const array = generateArrayOfInts(20);

    const subArray = breakArrayIntoSubArrays<number>({
      array,
      subArraySize: 10,
    });

    expect(subArray.length).toBe(2);
  });

  test("Returned subarrays' length should be 10", () => {
    const array = generateArrayOfInts(20);

    const subArray = breakArrayIntoSubArrays<number>({
      array,
      subArraySize: 10,
    });

    for (const array of subArray) {
      expect(array.length).toBe(10);
    }
  });

  test("Return an array that contains length 100 arrays with 2 tiems", () => {
    const array = generateArrayOfInts(200);

    const subArray = breakArrayIntoSubArrays<number>({
      array,
      subArraySize: 2,
    });

    expect(subArray.length).toBe(100);
  });

  test("Returned subarrays' length should be 2", () => {
    const array = generateArrayOfInts(200);

    const subArray = breakArrayIntoSubArrays<number>({
      array,
      subArraySize: 2,
    });

    for (const array of subArray) {
      expect(array.length).toBe(2);
    }
  });
});
