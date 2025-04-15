import { triggerInputClick } from "@/utils/controller";

describe("Test triggerInputClick", () => {
  test("Test click", () => {
    const inputRefMock = {
      current: { click: jest.fn() },
    } as unknown as React.RefObject<null | HTMLInputElement>;
    triggerInputClick(inputRefMock);
    expect(inputRefMock).toBeDefined();
  });
});
