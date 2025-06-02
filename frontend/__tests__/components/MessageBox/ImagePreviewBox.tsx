import ImagePreviewBox from "@/components/MessageBox/ImagePreviewBox";
import { render, act, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";

const removeImageMock = jest.fn(
  ({
    // eslint-disable-next-line
    image,
  }: {
    image: { file: File; index: number };
  }) => {}
);

const mockImage1 = {
  file: {
    name: "testfile1",
  },
  string: "blob: //testurl1/1",
  index: 1,
};

describe("Render ImagePreviewBox", () => {
  const user = userEvent.setup();

  test("Render image when image string exists", async () => {
    await act(async () =>
      render(
        <ImagePreviewBox
          image={{ file: mockImage1.file as File, string: mockImage1.string }}
          removeImage={removeImageMock}
          index={1}
        />
      )
    );

    const image = screen.getByRole("img") as HTMLImageElement;

    expect(image).toBeInTheDocument();
    expect(image.src).toBe(mockImage1.string);
    expect(image.alt).toBe(mockImage1.file.name);
  });

  test("Don't render image when image string is null", async () => {
    await act(async () =>
      render(
        <ImagePreviewBox
          image={{ file: mockImage1.file as File, string: null }}
          removeImage={removeImageMock}
          index={1}
        />
      )
    );

    const image = screen.queryByRole("img") as HTMLImageElement;

    expect(image).not.toBeInTheDocument();
  });

  test("Remove image when delete button is clicked", async () => {
    await act(async () =>
      render(
        <ImagePreviewBox
          image={{ file: mockImage1.file as File, string: null }}
          removeImage={removeImageMock}
          index={mockImage1.index}
        />
      )
    );

    const deleteButton = screen.queryByRole("button") as HTMLButtonElement;

    expect(deleteButton).toBeInTheDocument();
    await user.click(deleteButton);

    expect(removeImageMock).toHaveBeenCalledWith({
      image: { file: mockImage1.file, index: mockImage1.index },
    });
  });
});
