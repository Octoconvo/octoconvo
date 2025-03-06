import supabase from "./client";

const uploadFile = async ({
  folder,
  file,
  bucketName,
}: {
  folder: string;
  file: Express.Multer.File;
  bucketName: string;
}) => {
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(`${folder}/${file.originalname}`, file.buffer, {
      contentType: file.mimetype,
    });

  if (error) {
    throw new Error("Failed to upload file");
  }

  return data;
};

const getPublicURL = ({
  path,
  bucketName,
}: {
  path: string;
  bucketName: string;
}) => {
  const { data } = supabase.storage.from(bucketName).getPublicUrl(path);

  return data;
};

export { uploadFile, getPublicURL };
