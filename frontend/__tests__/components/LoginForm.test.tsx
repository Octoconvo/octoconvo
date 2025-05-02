import LoginForm from "@/components/Login/LoginForm";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const onSubmit = jest.fn();

describe("Render login page", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    render(
      <LoginForm
        onSubmit={onSubmit}
        validationError={[]}
        unauthorizedError={""}
        isSubmitting={false}
        resetError={() => {}}
      />
    );
  });

  it("Check whether username input is rendered", async () => {
    const input = screen.getByTestId("username");
    expect(input).toBeInTheDocument();
  });

  it("Check whether password input is rendered", async () => {
    const input = screen.getByTestId("password");
    expect(input).toBeInTheDocument();
  });

  it("Form submission failed if required fields are empty", async () => {
    const button = screen.getByRole("button", { name: "Log in" });
    expect(button).toBeInTheDocument();
    await user.click(button);
    expect(onSubmit).toHaveBeenCalledTimes(0);

    const errorUsername = screen.queryByTestId("rfh-username-err");
    expect(errorUsername).toBeInTheDocument();
    expect(errorUsername).toHaveTextContent("username is required");

    const errorPassword = screen.queryByTestId("rfh-password-err");
    expect(errorPassword).toBeInTheDocument();
    expect(errorPassword).toHaveTextContent("Password is required");
  });

  it(
    "Form submission failed if username field contains anything other than" +
      " alphanumerics and underscores",
    async () => {
      const username = screen.getByTestId("username") as HTMLInputElement;
      await user.type(username, "ABC.");
      expect(username.value).toEqual("ABC.");
      const button = screen.getByRole("button", { name: "Log in" });
      await user.click(button);
      expect(onSubmit).toHaveBeenCalledTimes(0);

      const errorUsername = screen.queryByTestId("rfh-username-err");
      expect(errorUsername).toBeInTheDocument();
      expect(errorUsername).toHaveTextContent(
        "Username must only contain alphanumerics and underscores"
      );
    }
  );

  it("Form submission failed if password is less than 8 characters", async () => {
    const password = screen.getByTestId("password") as HTMLInputElement;
    await user.type(password, "1234567");
    expect(password.value).toEqual("1234567");
    const button = screen.getByRole("button", { name: "Log in" });
    await user.click(button);
    expect(onSubmit).toHaveBeenCalledTimes(0);

    const errorPassword = screen.queryByTestId("rfh-password-err");
    expect(errorPassword).toBeInTheDocument();
    expect(errorPassword).toHaveTextContent(
      "Password must contain at least 8 characters"
    );
  });

  it(
    "Form submission failed if password doesn't contain at least one digit" +
      ", one lowercase letter, one uppercase letter, and one special character",
    async () => {
      const password = screen.getByTestId("password") as HTMLInputElement;
      await user.type(password, "test_123");
      expect(password.value).toEqual("test_123");
      const button = screen.getByRole("button", { name: "Log in" });
      await user.click(button);
      expect(onSubmit).toHaveBeenCalledTimes(0);

      const errorPassword = screen.queryByTestId("rfh-password-err");
      expect(errorPassword).toBeInTheDocument();
      expect(errorPassword).toHaveTextContent(
        "Password must contain at least one digit, one lowercase letter" +
          ", one uppercase letter, and one special character"
      );
    }
  );

  it("Call onSubmit if all fields passed the validation", async () => {
    const username = screen.getByTestId("username") as HTMLInputElement;
    const password = screen.getByTestId("password") as HTMLInputElement;

    await user.type(username, "test_user");
    expect(username.value).toEqual("test_user");

    await user.type(password, "Test_123");
    expect(password.value).toEqual("Test_123");
    const button = screen.getByRole("button", { name: "Log in" });
    await user.click(button);
    expect(onSubmit).toHaveBeenCalledTimes(1);

    const errorUsername = screen.queryByTestId("rfh-username-err");
    expect(errorUsername).toBeNull();

    const errorPassword = screen.queryByTestId("rfh-password-err");
    expect(errorPassword).toBeNull();
  });

  it("Check if password input type change correctly when clicking VisibilityButton", async () => {
    const password = screen.getByTestId("password") as HTMLInputElement;

    expect(password.type).toBe("password");

    const button = screen.getByTestId("visibility-button");

    await user.click(button);
    expect(password.type).toBe("text");
  });
});
