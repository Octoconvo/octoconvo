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

export { readFileAsDataURL, previewFile, selectFile };
