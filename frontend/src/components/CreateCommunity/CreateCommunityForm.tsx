"use client";

import Image from "next/image";
import { useState, useRef, useEffect, useContext } from "react";
import InputWrapper from "@/components/InputWrapper";
import type {
  CreateCommunityForm,
  ValidationError as ValidationErrorType,
} from "@/types/form";
import { SubmitHandler, useForm, FormProvider } from "react-hook-form";
import {
  communityNameValidation,
  communityBioValidation,
  avatarValidation,
  bannerValidation,
} from "@/utils/form";
import {
  ActiveModalsContext,
  CreateCommunityModalContext,
} from "@/contexts/modal";
import { previewFile, selectFile } from "@/utils/file";
import { triggerInputClick } from "@/utils/controller";
import ValidationError from "@/components/ValidationError";

const CreateCommunityForm = ({
  isSubmitting,
  onSubmit,
  validationError,
  resetError,
}: {
  isSubmitting: boolean;
  onSubmit: SubmitHandler<CreateCommunityForm>;
  validationError: ValidationErrorType[];
  resetError: () => void;
}) => {
  const { activeModals } = useContext(ActiveModalsContext);
  const { createCommunityModal } = useContext(CreateCommunityModalContext);
  const formRef = useRef<null | HTMLFormElement>(null);
  const methods = useForm<CreateCommunityForm>();
  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = methods;
  const [avatarFile, setAvatarFile] = useState<null | File>(null);
  const [bannerFile, setBannerFile] = useState<null | File>(null);
  const [avatar, setAvatar] = useState<null | string>(null);
  const [banner, setBanner] = useState<null | string>(null);
  const avatarInputRef = useRef<null | HTMLInputElement>(null);
  const bannerInputRef = useRef<null | HTMLInputElement>(null);
  const avatarRegister = register("avatar", avatarValidation);
  const bannerRegister = register("banner", bannerValidation);

  useEffect(() => {
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

    const resetFileInput = () => {
      if (
        activeModals.length < 1 ||
        activeModals[0]?.current !== createCommunityModal?.current
      ) {
        setAvatarFile(null);
        setBannerFile(null);
        if (formRef?.current) {
          formRef?.current.reset();
        }
        reset();
      }
    };

    previewFiles();
    resetFileInput();
  }, [
    activeModals,
    createCommunityModal,
    avatarFile,
    bannerFile,
    reset,
    validationError,
  ]);

  return (
    <FormProvider {...methods}>
      <form
        ref={formRef}
        method="POST"
        encType="multipart/form-data"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div>
          <button
            data-testid="crt-cmmnty-banner-btn"
            type="button"
            className={
              "add-image-icon before:h-[64px] before:w-[64px] w-full" +
              " bg-gr-brand-dark-d relative rounded-t-[inherit] aspect-[7/2]"
            }
            onClick={() => {
              triggerInputClick(bannerInputRef);
            }}
          >
            {banner && (
              <Image
                data-testid="crt-cmmnty-banner-btn"
                src={banner}
                alt="Community banner"
                width={1920}
                height={1080}
                className="aspect-[7/2] object-cover rounded-[inherit]"
                priority
              ></Image>
            )}
          </button>
        </div>
        <div className="flex flex-col gap-8 px-8">
          <div className="flex w-full relative h-[64px]">
            <button
              data-testid="crt-cmmnty-avatar-btn"
              type="button"
              className={
                "absolute left-0 top-[-64px] rounded-full" +
                " w-[128px] h-[128px] bg-grey-200 overflow-visible" +
                " add-image-icon before:h-[32px] before:w-[32px]"
              }
              onClick={() => {
                triggerInputClick(avatarInputRef);
              }}
            >
              {!avatar && <span className="avatar-add-icon"></span>}
              {avatar && (
                <Image
                  data-testid="crt-cmmnty-avatar-img"
                  src={avatar}
                  alt="Avatar image"
                  fill
                  className={"object-cover rounded-full"}
                  sizes="(max-width: 128px) 128px, (max-height: 128px) 128px"
                  priority
                ></Image>
              )}
            </button>
          </div>
          <input
            data-testid="crt-cmmnty-avatar"
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
              selectFile(e, setAvatarFile, ["image/png", "image/jpeg"]);
            }}
          />
          <input
            data-testid="crt-cmmnty-banner"
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
              selectFile(e, setBannerFile, ["image/png", "image/jpeg"]);
            }}
          />
          {errors.avatar && (
            <div className="text-invalid text-p">{errors.avatar.message}</div>
          )}
          {errors.banner && (
            <div className="text-invalid text-p">{errors.banner.message}</div>
          )}
          <InputWrapper>
            <label htmlFor="name">Community Name</label>
            {errors.name && (
              <div className="text-invalid text-p">{errors.name.message}</div>
            )}
            {validationError && (
              <ValidationError validationError={validationError} field="name" />
            )}
            <input
              data-testid="crt-cmmnty-name"
              id="name"
              type="text"
              {...register("name", communityNameValidation)}
              className="bg-grey-200 rounded-[8px] px-2 py-1 text-h6"
              onInput={() => {
                if (validationError.length) {
                  resetError();
                }
              }}
            />
          </InputWrapper>
          <InputWrapper>
            <label htmlFor="bio" className="text-white-100">
              Community Bio
            </label>
            {errors.bio && (
              <div className="text-invalid text-p">{errors.bio.message}</div>
            )}
            <textarea
              data-testid="crt-cmmnty-bio"
              id="bio"
              rows={5}
              {...register("bio", communityBioValidation)}
              className="bg-grey-200 rounded-[8px] px-2 py-1 resize-none text-h6"
            ></textarea>
          </InputWrapper>
          <div className="flex justify-end">
            <button
              data-testid="crt-cmmnty-sbmt-btn"
              type="submit"
              className={
                "w-min text-h6 bg-black-100 py-2 px-6 rounded-[4px]" +
                " hover:bg-brand-1"
              }
            >
              {isSubmitting ? "Submitting" : "Create"}
            </button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default CreateCommunityForm;
