import ProtectedRouteWrapper from "@/components/ProtectedRouteWrapper";
import { UserContext } from "@/contexts/user";
import { render } from "@testing-library/react";

const pushFn = jest.fn(() => {});

jest.mock(
  "next/navigation",
  jest.fn(() => ({
    useRouter: () => {
      return {
        push: pushFn,
      };
    },
  }))
);

describe("Render ProtectedRouteWrapper", () => {
  test("Don't redirect if user exists", () => {
    render(
      <UserContext.Provider value={{ user: { id: "1" }, setUser: () => {} }}>
        <ProtectedRouteWrapper route="\test">
          <div></div>
        </ProtectedRouteWrapper>
      </UserContext.Provider>
    );
    expect(pushFn).toHaveBeenCalledTimes(0);
  });

  test("Redirect if user is not authenticated", () => {
    render(
      <UserContext.Provider value={{ user: false, setUser: () => {} }}>
        <ProtectedRouteWrapper route="\test">
          <div></div>
        </ProtectedRouteWrapper>
      </UserContext.Provider>
    );
    expect(pushFn).toHaveBeenCalledTimes(1);
  });
});
