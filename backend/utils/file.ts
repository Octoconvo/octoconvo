import crypto from "crypto";
import path from "path";
import sharp from "sharp";
import { uploadFile, getPublicURL } from "../database/supabase/supabaseQueries";

const convertFileName = (file: Express.Multer.File): Express.Multer.File => {
  const uuid = crypto.randomUUID();
  const ext = path.extname(file.originalname);
  const updatedName = "image-" + uuid + ext;

  return { ...file, originalname: updatedName };
};

interface UploadFileAndGetUrlArgs {
  file: Express.Multer.File;
  folder: string;
  bucketName: string;
}

const uploadFileAndGetUrl = async ({
  file,
  folder,
  bucketName,
}: UploadFileAndGetUrlArgs): Promise<{ publicUrl: string }> => {
  const fileData = await uploadFile({
    file: file,
    bucketName: bucketName,
    folder: folder,
  });

  const fileUrl = getPublicURL({
    path: fileData.path,
    bucketName: bucketName,
  });

  return fileUrl;
};

interface ResizeAndCompressImageArgs {
  buffer: Buffer<ArrayBufferLike>;
  maxLength: number;
  quality: number;
}

const resizeAndCompressImage = async ({
  buffer,
  maxLength,
  quality,
}: ResizeAndCompressImageArgs): Promise<Buffer<ArrayBufferLike>> => {
  const metadata = await sharp(buffer).metadata();

  if (metadata.height && metadata.width && metadata.height > metadata.width) {
    return await sharp(buffer)
      .jpeg({ quality })
      .resize({
        height: maxLength,
        fit: "cover",
      })
      .toBuffer();
  } else {
    return await sharp(buffer)
      .jpeg({ quality })
      .resize({ height: maxLength, fit: "cover" })
      .toBuffer();
  }
};

export { convertFileName, uploadFileAndGetUrl, resizeAndCompressImage };
