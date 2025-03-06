import crypto from "crypto";
import path from "path";

const convertFileName = (file: Express.Multer.File): Express.Multer.File => {
  const uuid = crypto.randomUUID();
  const ext = path.extname(file.originalname);
  const updatedName = "image-" + uuid + ext;

  return { ...file, originalname: updatedName };
};

export { convertFileName };
