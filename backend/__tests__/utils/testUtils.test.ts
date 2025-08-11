import { getValidationErrorMsg } from "../../utils/testUtils";

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
