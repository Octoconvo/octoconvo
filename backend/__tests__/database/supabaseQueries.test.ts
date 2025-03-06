import {
  getPublicURL,
  uploadFile,
} from "../../database/supabase/supabaseQueries";
import { Buffer } from "node:buffer";

let error = false;

jest.mock("../../database/supabase/client", () => ({
  __esModule: true,
  default: {
    storage: {
      from: jest.fn((bucketName: string) => ({
        upload: jest.fn(
          async (
            path: string,
            _buffer: Buffer,
            obj: {
              contentType: string;
            },
          ) => {
            const ext = obj.contentType === "image/jpeg" ? "jpg" : null;

            return {
              ...(error ? { error: "Test error" } : {}),
              data: { path: `${bucketName}/${path}.${ext}` },
            };
          },
        ),
        getPublicUrl: jest.fn((path: string) => {
          return {
            data: {
              publicUrl: `www.testdomain.com/public/${bucketName}/${path}`,
            },
          };
        }),
      })),
    },
  },
}));

describe("Test uploadFile function", () => {
  test("Return correct data if no error occurs", async () => {
    const file = {
      originalname: "img-valid-01",
      mimetype: "image/jpeg",
      buffer: Buffer.from("test"),
    } as Express.Multer.File;

    const data = await uploadFile({
      folder: "test",
      file: file,
      bucketName: "avatar",
    });

    expect(data).toStrictEqual({
      path: "avatar/test/img-valid-01.jpg",
    });
  });

  test("Throw an error if supabase upload error occurs", async () => {
    error = true;

    const file = {
      originalname: "img-valid-01",
      mimetype: "image/jpeg",
      buffer: Buffer.from("test"),
    } as Express.Multer.File;

    try {
      await uploadFile({
        folder: "test",
        file: file,
        bucketName: "avatar",
      });
    } catch (err) {
      if (err instanceof Error) {
        expect(err.message).toBe("Failed to upload file");
      }
    }
  });
});

describe("Test getPublicURL function", () => {
  test("Return correct public URL", () => {
    const data = getPublicURL({
      path: "test/img-valid-01.jpg",
      bucketName: "avatar",
    });

    expect(data).toStrictEqual({
      publicUrl: "www.testdomain.com/public/avatar/test/img-valid-01.jpg",
    });
  });
});
