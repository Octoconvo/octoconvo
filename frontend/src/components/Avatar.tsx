import { FC } from "react";

type AvatarProps = {
  avatar: string | null;
  size: string;
  testId?: string;
};

const Avatar: FC<AvatarProps> = ({ avatar, size, testId }) => {
  const widthStyle = ` w-[${size}] min-w-[${size}]`;
  const heightStyle = ` h-[${size}] min-h-[${size}]`;

  return (
    <figure
      className={`bg-gr-black-2-r rounded-full` + widthStyle + heightStyle}
    >
      <img
        data-testid={testId}
        className={
          "object-center object-cover w-full" +
          " w-full h-full rounded-[inherit]"
        }
        src={avatar ? avatar : "/images/avatar-icon-white.svg"}
      />
    </figure>
  );
};

export default Avatar;
