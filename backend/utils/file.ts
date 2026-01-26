import crypto from "crypto";
import path from "path";
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

export { convertFileName, uploadFileAndGetUrl };
