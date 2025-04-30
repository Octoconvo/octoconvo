"use client";

import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import type { EditProfileForm } from "@/types/form";
import InputWrapper from "./InputWrapper";
import { UserProfileContext } from "@/contexts/user";
import { useContext, useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  avatarValidation,
  bannerValidation,
  displayNameValidation,
  bioValidation,
} from "@/utils/form";
import { previewFile, selectFile } from "@/utils/file";
import { ActiveModalsContext, EditProfileModalContext } from "@/contexts/modal";
import { triggerInputClick } from "@/utils/controller";

const EditProfileForm = ({
  onSubmit,
  isSubmitting,
}: {
  onSubmit: SubmitHandler<EditProfileForm>;
  isSubmitting: boolean;
}) => {
  const { userProfile } = useContext(UserProfileContext);
  const methods = useForm<EditProfileForm>({
    defaultValues: {
      displayname: "",
      bio: "",
    },
  });
  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = methods;
  const formRef = useRef<null | HTMLFormElement>(null);
  const [avatarFile, setAvatarFile] = useState<null | File>(null);
  const [bannerFile, setBannerFile] = useState<null | File>(null);
  const [avatar, setAvatar] = useState<null | string>(null);
  const [banner, setBanner] = useState<null | string>(null);
  const avatarInputRef = useRef<null | HTMLInputElement>(null);
  const bannerInputRef = useRef<null | HTMLInputElement>(null);
  const avatarRegister = register("avatar", avatarValidation);
  const bannerRegister = register("banner", bannerValidation);
  const [isInputInitialised, setIsInputInitialised] = useState<boolean>(false);
  const { activeModals } = useContext(ActiveModalsContext);
  const { editProfileModal } = useContext(EditProfileModalContext);

  useEffect(() => {
    const initialiseFileInput = () => {
      if (userProfile) {
        setAvatar(userProfile.avatar);
        setBanner(userProfile.banner);
      }
    };

    const initialiseInput = () => {
      if (userProfile) {
        reset({
          displayname: userProfile.displayName,
          bio: userProfile.bio ? userProfile.bio : " ",
        });
      }
    };

    const previewFiles = async () => {
      if (bannerFile) {
        const bannerPreview = await previewFile({ file: bannerFile });

        if (bannerPreview) {
          setBanner(bannerPreview);
        }
      }

      if (avatarFile) {
        const avatarPreview = await previewFile({ file: avatarFile });

        if (avatarPreview) {
          setAvatar(avatarPreview);
        }
      }
    };

    const initialise = () => {
      if (!isInputInitialised) {
        initialiseFileInput();
        initialiseInput();

        if (userProfile) {
          setIsInputInitialised(true);
        }
      }
    };

    const resetFileInput = () => {
      if (
        activeModals.length < 1 ||
        activeModals[0]?.current !== editProfileModal?.current
      ) {
        setAvatarFile(null);
        setBannerFile(null);
        initialiseInput();
        initialiseFileInput();
        if (formRef?.current) {
          formRef?.current.reset();
        }
      }
    };

    initialise();
    previewFiles();
    resetFileInput();
  }, [
    userProfile,
    avatarFile,
    bannerFile,
    isInputInitialised,
    reset,
    activeModals,
    editProfileModal,
  ]);

  const mimetype = ["image/png", "image/jpeg"];

  return (
    <FormProvider {...methods}>
      <form
        ref={formRef}
        method="POST"
        encType="multipart/form-data"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col items-end"
      >
        <div className="flex flex-col w-full">
          <button
            data-testid="edt-prfl-banner-btn"
            type="button"
            className={
              "w-full bg-gr-brand-dark-d relative rounded-t-[inherit] aspect-[7/2]" +
              " add-image-icon before:h-[64px] before:w-[64px] w-full"
            }
            onClick={() => {
              triggerInputClick(bannerInputRef);
            }}
          >
            {banner && (
              <Image
                data-testid="edt-prfl-banner-img"
                src={banner}
                alt="profile banner"
                width={1920}
                height={1080}
                className="aspect-[7/2] object-cover rounded-[inherit]"
                priority
              ></Image>
            )}
          </button>
          <div className="flex flex-col gap-8 px-8">
            <div className="flex w-full relative h-[64px]">
              <button
                data-testid="edt-prfl-avatar-btn"
                type="button"
                className={
                  "absolute left-0 top-[-64px] rounded-full w-[128px]" +
                  " h-[128px] bg-grey-200 overflow-visible" +
                  " add-image-icon before:h-[32px] before:w-[32px]"
                }
                onClick={() => {
                  triggerInputClick(avatarInputRef);
                }}
              >
                {!avatar && <span className="avatar-add-icon"></span>}
                {avatar && (
                  <Image
                    data-testid="edt-prfl-avatar-img"
                    src={avatar}
                    alt="avatar image"
                    fill
                    className="object-cover rounded-full"
                    sizes="(max-width: 128px) 128px, (max-height: 128px) 128px"
                    priority
                  ></Image>
                )}
              </button>
            </div>
            <input
              data-testid="edt-prfl-avatar"
              type="file"
              id="avatar"
              accept="image/png, image/jpeg"
              className="hidden"
              {...avatarRegister}
              ref={(e) => {
                avatarRegister.ref(e);
                avatarInputRef.current = e;
              }}
              onInput={(e) => {
                selectFile(e, setAvatarFile, mimetype);
              }}
            />
            <input
              data-testid="edt-prfl-banner"
              type="file"
              id="banner"
              accept="image/png, image/jpeg"
              className="hidden"
              {...bannerRegister}
              ref={(e) => {
                bannerRegister.ref(e);
                bannerInputRef.current = e;
              }}
              onInput={(e) => {
                selectFile(e, setBannerFile, mimetype);
              }}
            />
            {errors.avatar && (
              <div className="text-invalid">{errors.avatar.message}</div>
            )}
            {errors.banner && (
              <div className="text-invalid">{errors.banner.message}</div>
            )}
            <InputWrapper>
              <label htmlFor="displayname">Display name</label>
              {errors.displayname && (
                <div className="text-invalid text-p">
                  {errors.displayname.message}
                </div>
              )}
              <input
                data-testid="edt-prfl-displayname"
                id="displayname"
                type="text"
                className="bg-grey-200 rounded-[8px] px-2 py-1 text-h6"
                defaultValue={userProfile ? userProfile.displayName : ""}
                {...register("displayname", displayNameValidation)}
              />
            </InputWrapper>
            <InputWrapper>
              <label htmlFor="bio" className="text-white-100">
                Bio
              </label>
              {errors.bio && (
                <div className="text-invalid text-p">{errors.bio.message}</div>
              )}
              <textarea
                data-testid="edt-prfl-bio"
                id="bio"
                rows={5}
                defaultValue={
                  userProfile ? (userProfile.bio ? userProfile.bio : "") : ""
                }
                {...register("bio", bioValidation)}
                className="bg-grey-200 rounded-[8px] px-2 py-1 resize-none text-h6"
              ></textarea>
            </InputWrapper>
            <div className="flex justify-end">
              <button
                data-testid="edt-prfl-sbmt-btn"
                type="submit"
                className={
                  "w-min bg-black-100 py-2 px-6 rounded-[8px]" +
                  " hover:bg-brand-1"
                }
              >
                {isSubmitting ? "Submitting" : "Save"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default EditProfileForm;
