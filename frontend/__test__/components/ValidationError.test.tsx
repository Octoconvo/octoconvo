import ValidationError from "@/components/ValidationError";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

const mockValidationError = [
  {
    field: "username",
    value: "client_user_1",
    msg: "Username is already taken",
  },
];

describe("Render ValidatioError component", () => {
  it(
    "Render error list if validation error contain objects with field " +
      "equal to field prop",
    () => {
      render(
        <ValidationError
          validationError={mockValidationError}
          field="username"
        />
      );
      const usernameError = screen.queryByText("Username is already taken");
      expect(usernameError).toBeInTheDocument();
    }
  );

  it(
    "Render empty list if validation error doesn't contain objects with field " +
      "equal to field prop",
    () => {
      render(
        <ValidationError
          validationError={mockValidationError}
          field="password"
        />
      );
      const usernameError = screen.queryByText("Username is already taken");
      expect(usernameError).toBeNull();
    }
  );

  it("Render empty list when validationError is empty", () => {
    render(<ValidationError validationError={[]} field="username" />);
    const errorList = screen.getByRole("list");
    expect(errorList).toBeInTheDocument();
    expect(errorList).toBeEmptyDOMElement();
  });
});
