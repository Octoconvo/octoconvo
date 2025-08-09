const readFileAsDataURL = async ({ file }: { file: File }): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
      resolve(reader.result as string);
    };

    reader.onerror = () => {
      reject("An error has occured when converting file");
    };
  });
};

const previewFile = async ({
  file,
}: {
  file: File;
}): Promise<string | null> => {
  try {
    const image: string = await readFileAsDataURL({ file });
    return image;
  } catch (err) {
    console.log({ err });
    if (err instanceof Error) {
      console.log(err.message);
    }
    return null;
  }
};

// Preview image with specified max height for better performance
const previewImage = async ({
  file,
  maxHeight,
  maxWidth,
}: {
  file: File;
  maxHeight?: number;
  maxWidth?: number;
}): Promise<string | null> => {
  try {
    const image = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (context) {
      // Scale down image
      const ratio = maxHeight
        ? maxHeight / image.height
        : maxWidth
        ? maxWidth / image.width
        : 1;

      const width = image.width * ratio;
      const height = image.height * ratio;

      canvas.width = width;
      canvas.height = height;

      context.drawImage(image, 0, 0, width, height);

      const blob: string | null = await new Promise((resolve) =>
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(URL.createObjectURL(blob));
          } else {
            resolve(null);
          }
        })
      );

      return blob;
    }

    return null;
  } catch (err) {
    console.log(err);
    return null;
  }
};

const selectFile = (
  e: React.FormEvent<HTMLInputElement>,
  setFile: React.Dispatch<React.SetStateAction<null | File>>,
  mimetype: RegExp | string[]
) => {
  const fileInput = e.target as HTMLInputElement;
  const file = fileInput.files ? fileInput.files[0] : null;
  let isAccepted = false;

  if (mimetype instanceof RegExp) {
    isAccepted = file ? mimetype.test(file.type) : false;
  } else {
    isAccepted = file ? mimetype.includes(file.type) : false;
  }

  if (isAccepted) {
    setFile(file);
  }
};

// Validate files
const validateFiles = ({
  e,
  mimetype,
  maxSize,
}: {
  e: React.FormEvent<HTMLInputElement>;
  mimetype: RegExp | string[];
  maxSize?: number;
}): FileList | null => {
  const fileInput = e.target as HTMLInputElement;
  const files = fileInput.files ? fileInput.files : null;

  if (files) {
    for (const file of files) {
      if (mimetype instanceof RegExp) {
        const isValid = mimetype.test(file.type);

        if (!isValid) {
          throw new Error("Invalid mimetype");
        }
      } else {
        const isValid = mimetype.includes(file.type);

        if (!isValid) {
          throw new Error("Invalid mimetype");
        }
      }

      if (maxSize && file.size > maxSize) {
        throw new Error("File size is too big");
      }
    }
  }

  return files;
};

export {
  readFileAsDataURL,
  previewFile,
  selectFile,
  validateFiles,
  previewImage,
};
