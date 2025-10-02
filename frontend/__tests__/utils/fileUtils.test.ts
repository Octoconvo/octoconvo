import {
  readFileAsDataURL,
  previewFile,
  selectFile,
  validateFiles,
} from "@/utils/fileUtils";

jest.unmock("@/utils/fileUtils");

describe("Test readFileAsDataURL", () => {
  test("Return dataURL on success", async () => {
    const file = new File(["a".repeat(1024)], "image-test");

    const result = await readFileAsDataURL({ file });
    expect(result).toBeTruthy();
  });
});

describe("Test previewFile function", () => {
  beforeAll(() => {
    jest.spyOn(FileReader.prototype, "readAsDataURL").mockImplementationOnce(
      jest.fn(() => {
        throw new Error("An error has occured");
      })
    );
  });

  test("Test previewFile error", async () => {
    const logSpy = jest
      .spyOn(console, "log")
      .mockImplementation(jest.fn((val: string) => val));
    const file = new File(["a".repeat(1024)], "image-test");
    await previewFile({ file: file });
    expect(logSpy).toHaveBeenCalledWith("An error has occured");
  });

  test("Test previewFile success", async () => {
    const file = new File(["a".repeat(1024)], "image-test");
    const result = await previewFile({ file: file });
    expect(result).toContain("data:application");
  });
});

describe("Test selectFile function", () => {
  test("Test accepted file type using array mimetype", () => {
    const file = new File(["a".repeat(1024)], "test-file", {
      type: "image/png",
    });

    const eventMock = {
      target: {
        files: [file],
      },
    } as unknown as React.FormEvent<HTMLInputElement>;

    const setFile = jest.fn(() => {});
    const mimetype = ["image/png"];
    selectFile(eventMock, setFile, mimetype);

    expect(setFile).toHaveBeenCalled();
  });

  test("Test accepted file type using regex mimetype", () => {
    const file = new File(["a".repeat(1024)], "test-file", {
      type: "image/png",
    });

    const eventMock = {
      target: {
        files: [file],
      },
    } as unknown as React.FormEvent<HTMLInputElement>;

    const setFile = jest.fn(() => {});
    const mimetype = new RegExp("image/png");
    selectFile(eventMock, setFile, mimetype);

    expect(setFile).toHaveBeenCalled();
  });
});

describe("Test validateFiles function", () => {
  test("Return files if validation passed", () => {
    const file = new File(["a".repeat(1024)], "test-file", {
      type: "image/png",
    });

    const eventMock = {
      target: {
        files: [file, file],
      },
    } as unknown as React.FormEvent<HTMLInputElement>;

    const mimetype = ["image/png"];

    const files = validateFiles({
      e: eventMock,
      mimetype,
      maxSize: 5000000,
    });

    expect(files).toContain(file);
  });

  test("Throw error if file exceeds max file size", () => {
    const file = new File(["a".repeat(1024)], "test-file", {
      type: "image/png",
    });

    const eventMock = {
      target: {
        files: [file, file],
      },
    } as unknown as React.FormEvent<HTMLInputElement>;

    const mimetype = ["image/png"];

    try {
      validateFiles({
        e: eventMock,
        mimetype,
        maxSize: 500,
      });
    } catch (err) {
      if (err instanceof Error)
        expect(err.message).toBe("File size is too big");
    }
  });

  test("Test mimetype white list using array", () => {
    const file = new File(["a".repeat(1024)], "test-file", {
      type: "image/svg",
    });

    const eventMock = {
      target: {
        files: [file, file],
      },
    } as unknown as React.FormEvent<HTMLInputElement>;

    const mimetype = ["image/png"];

    try {
      validateFiles({
        e: eventMock,
        mimetype,
        maxSize: 5000000,
      });
    } catch (err) {
      if (err instanceof Error) expect(err.message).toBe("Invalid mimetype");
    }
  });

  test("Test mimetype white list using regex", () => {
    const file = new File(["a".repeat(1024)], "test-file", {
      type: "image/svg",
    });

    const eventMock = {
      target: {
        files: [file, file],
      },
    } as unknown as React.FormEvent<HTMLInputElement>;

    const mimetype = new RegExp(/^[image/png]$/);

    try {
      validateFiles({
        e: eventMock,
        mimetype,
        maxSize: 5000000,
      });
    } catch (err) {
      if (err instanceof Error) expect(err.message).toBe("Invalid mimetype");
    }
  });
});
