import CreateCommunityModal from "@/components/CreateCommunity/CreateCommunityModal";
import { act, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { ActiveModalsContext } from "@/contexts/modal";
import ActiveModalProvider from "@/components/ActiveModalProvider";
import CreateCommunityModalProvider from "@/components/CreateCommunity/CreateCommunityModalProvider";
import LobbyNavWrapper from "@/components/Lobby/LobbyNavWrapper";
import QueryProvider from "@/components/QueryProvider";

const openModalMock = jest.fn();
const closeModalMock = jest.fn();

// mock useRouter
jest.mock("next/navigation", () => {
  const originalModule = jest.requireActual("next/navigation");
  return {
    useRouter: jest.fn(),
    usePathname: originalModule.usePathname,
  };
});

describe("Render CreateCommunityModal", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    render(
      <QueryProvider>
        <ActiveModalsContext.Provider
          value={{
            activeModals: [],
            openModal: openModalMock,
            closeModal: closeModalMock,
          }}
        >
          <CreateCommunityModal></CreateCommunityModal>
        </ActiveModalsContext.Provider>
      </QueryProvider>
    );
  });

  test("Close button work correctly", async () => {
    const button = screen.getByTestId("crt-cmmnty-mdl-cls-btn");

    expect(button).toBeDefined();

    await user.click(button);

    expect(closeModalMock).toHaveBeenCalled();
  });
});

describe("Render CreateCommunityModal", () => {
  const user = userEvent.setup();

  beforeEach(async () => {
    await act(async () => {
      render(
        <QueryProvider>
          <ActiveModalProvider>
            <CreateCommunityModalProvider>
              <LobbyNavWrapper></LobbyNavWrapper>
            </CreateCommunityModalProvider>
          </ActiveModalProvider>
        </QueryProvider>
      );
    });
  });

  test("Show modal when ActiveModals contain CreateCommunityModalProvider", async () => {
    const modal = screen.getByTestId("crt-cmmnty-modal-main");
    const openBtn = screen.getByTestId("crt-cmmnty-mdl-opn-btn");
    const closeBtn = screen.getByTestId("crt-cmmnty-mdl-cls-btn");

    expect(modal).toBeDefined();
    expect(openBtn).toBeDefined();

    await user.click(openBtn);

    expect(modal.className).not.toContain("hidden");

    await user.click(closeBtn);

    expect(modal.className).toContain("hidden");
  });
});
