import {
  generateArrayOfInts,
  getValidationErrorMsg,
} from "../../utils/testUtils";

describe("Test getValidationErrorMsg function", () => {
  test("Return null if the error object is undefined", () => {
    const string = getValidationErrorMsg({
      field: "testfield1",
    });

    expect(string).toBe(null);
  });

  test("Return the msg if the field exists", () => {
    const string = getValidationErrorMsg({
      error: {
        validationError: [
          { field: "testfield1", value: "testvalue1", msg: "testmsg1" },
        ],
      },
      field: "testfield1",
    });

    expect(string).toBe("testmsg1");
  });

  test("Return null if the field doesn't exist", () => {
    const string = getValidationErrorMsg({
      error: {
        validationError: [
          { field: "testfield2", value: "testvalue2", msg: "testmsg2" },
        ],
      },
      field: "testfield1",
    });

    expect(string).toBe(null);
  });
});

describe("Test generateArrayOfInts function", () => {
  test("Return an array with 20 items", () => {
    const array = generateArrayOfInts(20);
    expect(array.length).toBe(20);
  });

  test("Return [1, 2, 3] if size argument is 3", () => {
    const array = generateArrayOfInts(3);
    expect(array).toStrictEqual([1, 2, 3]);
  });

  test("Return an array with 9999 items", () => {
    const array = generateArrayOfInts(9999);
    expect(array.length).toBe(9999);
  });

  test("The last item should be 123456 if the size is 123456", () => {
    const array = generateArrayOfInts(123456);
    expect(array[array.length - 1]).toBe(123456);
  });
});
