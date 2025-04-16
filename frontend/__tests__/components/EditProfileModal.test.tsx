import EditProfileModal from "@/components/EditProfileModal";
import { act, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { ActiveModalsContext } from "@/contexts/modal";
import ActiveModalProvider from "@/components/ActiveModalProvider";
import EditProfileModalProvider from "@/components/EditProfileModalProvider";
import LobbyNavWrapper from "@/components/LobbyNavWrapper";

const openModalMock = jest.fn();
const closeModalMock = jest.fn();

describe("Render EditProfileModal", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    render(
      <ActiveModalsContext.Provider
        value={{
          activeModals: [],
          openModal: openModalMock,
          closeModal: closeModalMock,
        }}
      >
        <EditProfileModal></EditProfileModal>
      </ActiveModalsContext.Provider>
    );
  });

  test("Close button work correctly", async () => {
    const button = screen.getByTestId("edt-prfl-mdl-cls-btn");

    expect(button).toBeDefined();

    await user.click(button);

    expect(closeModalMock).toHaveBeenCalled();
  });
});

describe("Render EditProfileModal", () => {
  const user = userEvent.setup();

  beforeEach(async () => {
    await act(async () => {
      render(
        <ActiveModalProvider>
          <EditProfileModalProvider>
            <LobbyNavWrapper></LobbyNavWrapper>
          </EditProfileModalProvider>
        </ActiveModalProvider>
      );
    });
  });

  test("Show modal when ActiveModals contain EditProfileModal", async () => {
    const modal = screen.getByTestId("edt-prfl-mdl-main");
    const button = screen.getByTestId("main-btn");
    const closeBtn = screen.getByTestId("edt-prfl-mdl-cls-btn");

    expect(modal).toBeDefined();
    expect(button).toBeDefined();

    await user.click(button);

    expect(modal.className).not.toContain("hidden");

    await user.click(closeBtn);

    expect(modal.className).toContain("hidden");
  });
});
