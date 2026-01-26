import crypto from "crypto";
import path from "path";
import sharp, { Metadata } from "sharp";
import { uploadFile, getPublicURL } from "../database/supabase/supabaseQueries";
import { Attachment, AttachmentSubtype, AttachmentType } from "@prisma/client";

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

const processImageAttachment = async (
  file: Express.Multer.File,
): Promise<{
  image: Express.Multer.File;
  thumbnail: Express.Multer.File;
}> => {
  const image: Express.Multer.File = convertFileName(file);
  const thumbnail: Express.Multer.File = convertFileName(file);
  image.buffer = await resizeAndCompressImage({
    buffer: image.buffer,
    maxLength: 720,
    quality: 70,
  });
  thumbnail.buffer = await resizeAndCompressImage({
    buffer: image.buffer,
    maxLength: 720,
    quality: 70,
  });

  return { image, thumbnail };
};

interface CreateAttachmentDataArgs {
  file: Express.Multer.File;
  url: string;
  thumbnailUrl: string;
}

type AttachmentData = Pick<
  Attachment,
  "type" | "subtype" | "width" | "height" | "size" | "url" | "thumbnailUrl"
>;

const createAttachmentData = async ({
  file,
  url,
  thumbnailUrl,
}: CreateAttachmentDataArgs): Promise<AttachmentData> => {
  const metadata: Metadata = await sharp(file.buffer).metadata();
  const type: AttachmentType = file.mimetype
    .split("/")[0]
    .toUpperCase() as AttachmentType;
  const subtype: AttachmentSubtype = file.mimetype
    .split("/")[1]
    .toUpperCase() as AttachmentSubtype;

  return {
    type: type,
    subtype: subtype,
    width: metadata.width || null,
    height: metadata.height || null,
    size: metadata.size || null,
    url: url,
    thumbnailUrl: thumbnailUrl,
  };
};

export {
  convertFileName,
  uploadFileAndGetUrl,
  resizeAndCompressImage,
  processImageAttachment,
  createAttachmentData,
};
