import Image from "next/image";

const ImagePreviewBox = ({
  image,
  removeImage,
  index,
}: {
  image: { file: File; string: string | null };
  removeImage: ({
    image,
  }: {
    image: {
      file: File;
      index: number;
    };
  }) => void;
  index: number;
}) => {
  return (
    <>
      <li className="relative min-w-[150px] min-h-[150px] rounded-[8px]">
        {image.string && (
          <Image
            className="rounded-[8px] object-cover"
            src={image.string}
            fill={true}
            alt={image.file.name}
          />
        )}
        <button
          className="delete-btn"
          onClick={() => {
            removeImage({
              image: {
                file: image.file,
                index,
              },
            });
          }}
        ></button>
      </li>
    </>
  );
};

export default ImagePreviewBox;
