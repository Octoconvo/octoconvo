import CommunitiesListWrapper from "@/components/Communities/CommunitiesList/CommunitiesListWrapper";
import { render, act, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { UserContext } from "@/contexts/user";

const communitiesList = [
  {
    id: "1",
    name: "Community_Test_Name",
    bio: "Community_Test_Bio",
    avatar: "http://Community_Test_Avatar",
    banner: null,
    isDeleted: false,
    createdAt: "test",
    updatedAt: "test",
  },
  {
    id: "2",
    name: "Community_Test_Name_1",
    bio: "Community_Test_Bio_1",
    avatar: null,
    banner: null,
    isDeleted: false,
    createdAt: "test",
    updatedAt: "test",
  },
];

const successObj = {
  message: "Successfully created community",
  communities: communitiesList,
};

const failureObj = {
  error: {
    message: "You are not authenticated",
  },
};

type Config = { body: FormData };

global.fetch = jest
  .fn(
    (
      //eslint-disable-next-line
      _url,
      //eslint-disable-next-line
      config: Config
    ): Promise<{ status: number; json: () => Promise<object> }> => {
      return Promise.resolve({
        status: 200,
        json: () => Promise.resolve(successObj),
      });
    }
  )
  .mockImplementationOnce(
    //eslint-disable-next-line
    jest.fn((_url, config: Config) => {
      return Promise.resolve({
        status: 401,
        json: () => Promise.resolve(failureObj),
      });
    })
  ) as jest.Mock;

describe("Render CommunitiesListWrapper with valid user context", () => {
  beforeEach(async () => {
    await act(async () =>
      render(
        <UserContext.Provider value={{ user: { id: "1" }, setUser: () => {} }}>
          <CommunitiesListWrapper />
        </UserContext.Provider>
      )
    );
  });

  test("Render 0 communitiesList when intial fetch fails", () => {
    const list = screen.queryAllByTestId("cmmnts-cmmnty-lst");

    expect(list.length).toBe(0);
  });

  test("Fetch and render all communtiesList when user context is not null or truthy", async () => {
    await waitFor(() => {
      const list = screen.getAllByTestId("cmmnts-cmmnty-lst");

      expect(list.length).toBe(2);
    });
  });
});

describe("Render CommunitiesListWrapper with null user context", () => {
  beforeEach(async () => {
    await act(async () =>
      render(
        <UserContext.Provider value={{ user: null, setUser: () => {} }}>
          <CommunitiesListWrapper />
        </UserContext.Provider>
      )
    );
  });

  test("Don't fetch and render communitiesList when user context is falsy or null", () => {
    const list = screen.queryAllByTestId("cmmnts-cmmnty-lst");

    expect(list.length).toBe(0);
  });
});
