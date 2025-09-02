import { getLastItemInTheArray } from "../../utils/array";

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
