import { createSignupOnSubmit, createOnSubmit } from "@/utils/form";
import { SignupForm as SignupFormType } from "@/types/form";
import SignupForm from "@/components/SignupForm";
import { User } from "@/types/user";
import { avatarValidation, bannerValidation, getFormData } from "@/utils/form";

const errorObj = {
  message: "Failed to sign up",
  error: {
    validationError: [
      {
        field: "username",
        msg: "Username is already taken",
        value: "test_user_1",
      },
    ],
  },
};

const successObj = {
  message: "Successfully created a new account",
  user: {
    id: "12345678",
  },
};

type Config = { body: URLSearchParams };
global.fetch = jest.fn((_url, config: Config) => {
  if (config.body.get("username") === "ERROR") {
    return Promise.resolve().then(() => {
      throw new TypeError("Network Error");
    });
  }
  return Promise.resolve({
    status: config.body.get("username") === "test_user_1" ? 422 : 200,
    json: () =>
      Promise.resolve(
        config.body.get("username") === "test_user_1" ? errorObj : successObj
      ),
  });
}) as jest.Mock;

describe("Test createSignupOnSubmit function", () => {
  it("Run errorHandler when response status >= 400", async () => {
    const errorHandler = jest.fn(() => console.log());
    const successHandler = jest.fn();
    const signupSubmit = createSignupOnSubmit({ errorHandler, successHandler });

    const mockData = {
      username: "test_user_1",
      password: "Test_123",
    };
    await signupSubmit(mockData);
    expect(errorHandler).toHaveBeenCalled();
  });

  it("Run successHandler when response status < 400", async () => {
    const errorHandler = jest.fn(() => {});
    const successHandler = jest.fn(() => {});
    const signupSubmit = createSignupOnSubmit({
      errorHandler,
      successHandler,
    });

    const mockData = {
      username: "test_user_2",
      password: "Test_123",
    };
    await signupSubmit(mockData);
    expect(successHandler).toHaveBeenCalled();
  });

  describe("Test createSignupOnSubmit function", () => {
    it("Run errorHandler when response status >= 400", async () => {
      const errorHandler = jest.fn((err) => console.log(err));
      const successHandler = jest.fn();
      const signupSubmit = createSignupOnSubmit({
        errorHandler,
        successHandler,
      });

      const mockData = {
        username: "test_user_1",
        password: "Test_123",
      };
      await signupSubmit(mockData);
      expect(errorHandler).toHaveBeenCalled();
    });

    it("Catch err if fetch throw an error", async () => {
      const errorHandler = jest.fn(() => {});
      const successHandler = jest.fn(() => {});
      const signupSubmit = createSignupOnSubmit({
        errorHandler,
        successHandler,
      });

      const mockData = {
        username: "ERROR",
        password: "Test_123",
      };

      jest.spyOn(console, "log").mockImplementation();
      await signupSubmit(mockData);
      expect(console.log).toHaveBeenCalledTimes(2);
      expect(console.log).toHaveBeenCalledWith("Network Error");
    });
  });
});

describe("Test createOnSubmit function", () => {
  const getFormDataMock = jest.fn(<SignupFormType,>(data: SignupFormType) => {
    const formData = new URLSearchParams();

    for (const prop in data) {
      formData.append(prop, data[prop] as string);
    }
    return formData;
  });

  const errorHandler = jest.fn(() => {});
  const successHandler = jest.fn();
  const initialHandler = jest.fn();
  const doneHandler = jest.fn();
  const getFormData = getFormDataMock;
  const config = {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };
  const path = "test";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Run errorHandler when response status >= 400", async () => {
    const onSubmit = createOnSubmit<SignupForm, User>({
      initialHandler,
      doneHandler,
      errorHandler,
      successHandler,
      getFormData,
      config,
      path,
    });

    const mockData = {
      username: "test_user_1",
      password: "Test_123",
    };
    await onSubmit(mockData);
    expect(errorHandler).toHaveBeenCalled();
  });

  it("Run successHandler when response status < 400", async () => {
    const onSubmit = createOnSubmit<SignupForm, User>({
      initialHandler,
      doneHandler,
      errorHandler,
      successHandler,
      getFormData,
      config,
      path,
    });

    const mockData = {
      username: "test_user_2",
      password: "Test_123",
    };
    await onSubmit(mockData);
    expect(successHandler).toHaveBeenCalled();
  });

  describe("Test createSignupOnSubmit function", () => {
    it("Run errorHandler when response status >= 400", async () => {
      const onSubmit = createOnSubmit<SignupFormType, User>({
        initialHandler,
        doneHandler,
        errorHandler,
        successHandler,
        getFormData,
        config,
        path,
      });

      const mockData = {
        username: "test_user_1",
        password: "Test_123",
      };
      await onSubmit(mockData);
      expect(errorHandler).toHaveBeenCalled();
    });

    it("Catch err if fetch throw an error", async () => {
      const onSubmit = createOnSubmit<SignupFormType, User>({
        initialHandler,
        doneHandler,
        errorHandler,
        successHandler,
        getFormData,
        config,
        path,
      });

      const mockData = {
        username: "ERROR",
        password: "Test_123",
      };

      jest.spyOn(console, "log").mockImplementation();
      await onSubmit(mockData);
      expect(console.log).toHaveBeenCalledTimes(1);
      expect(console.log).toHaveBeenCalledWith("Network Error");
    });
  });
});

describe("Test bannerValidation", () => {
  test("Return value if fileList is emtpy", () => {
    // eslint-disable-next-line
    const fileListMock = [] as any;
    const result = bannerValidation.validate(fileListMock);

    expect(result).toBe(fileListMock);
  });

  test("Return value if file is valid", () => {
    const file = new File(["a".repeat(1024)], "image-test", {
      type: "image/png",
    });
    // eslint-disable-next-line
    const fileListMock = [file] as any;
    const result = bannerValidation.validate(fileListMock);

    expect(result).toBe(fileListMock);
  });
});

describe("Test avatarValidation", () => {
  test("Return value if fileList is emtpy", () => {
    // eslint-disable-next-line
    const fileListMock = [] as any;
    const result = avatarValidation.validate(fileListMock);

    expect(result).toBe(fileListMock);
  });

  test("Return value if file is valid", () => {
    const file = new File(["a".repeat(1024)], "image-test", {
      type: "image/png",
    });
    // eslint-disable-next-line
    const fileListMock = [file] as any;
    const result = avatarValidation.validate(fileListMock);

    expect(result).toBe(fileListMock);
  });
});

describe("Test getFormData function", () => {
  const file = new File(["a".repeat(1024)], "test-file", {
    type: "imaga/png",
  });

  const userData = {
    username: "username_test_1",
    avatat: [file],
  };

  test("Test getFormData function", () => {
    const result = getFormData(userData);
    console.log({ result });
    expect(result).toBeDefined();
  });
});
