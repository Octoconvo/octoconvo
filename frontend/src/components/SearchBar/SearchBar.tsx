import { SearchBarForm } from "@/types/form";
import { searchBarNameValidation } from "@/utils/form";
import { useState, useRef } from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";

const SearchBar = ({
  path,
  onSubmitFn,
  onSuccessFn,
  onResetFn,
}: {
  path: string;
  onSubmitFn: (data: SearchBarForm) => void;
  onSuccessFn: <Data>({
    data,
    nextCursor,
  }: {
    data: Data;
    nextCursor: string | false;
  }) => void;
  onResetFn: () => void;
}) => {
  const [queryView, setQueryView] = useState<boolean>(false);
  const inputRef = useRef<null | HTMLInputElement>(null);
  const methods = useForm<SearchBarForm>();
  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = methods;
  const nameRegister = register("name", searchBarNameValidation);

  const onSubmit: SubmitHandler<SearchBarForm> = async (data) => {
    onSubmitFn(data);
    const domainURL = process.env.NEXT_PUBLIC_DOMAIN_URL;

    try {
      const response = await fetch(
        `${domainURL}/explore/${path}?name=${data.name}`,
        {
          mode: "cors",
          credentials: "include",
          method: "GET",
        }
      );

      const responseData = await response.json();
      // Handle errors
      if (response.status < 400) {
        onSuccessFn({
          data: responseData[path],
          nextCursor: responseData.nextCursor,
        });
        setQueryView(true);
        reset();
      }
    } catch (err) {
      if (err instanceof Error) {
        console.log(err.message);
      }
    }
  };

  return (
    <div className="flex items-center gap-[16px]">
      {queryView && (
        <button
          data-testid="srchbr-rst-qry-btn"
          onClick={() => {
            setQueryView(false);
            onResetFn();
          }}
          type="button"
          aria-label="reset query"
          className="text-h5 p-[4px] hover:translate-x-[-4px] rounded-full"
        >
          <span className="back-button-icon"></span>
        </button>
      )}

      <div className="relative flex w-[min(100%,480px)] bg-grey-100 rounded-[8px] p-[8px]">
        <FormProvider {...methods}>
          <form
            method="POST"
            onSubmit={handleSubmit(onSubmit)}
            className="flex w-full"
          >
            <div className="flex w-full">
              <label className="absolute text-p opacity-0" htmlFor="name">
                Search
              </label>
              <input
                data-testid="srchbr-nm-input"
                className="searchbar-input"
                type="text"
                id="name"
                placeholder="Search"
                autoComplete="explore"
                {...nameRegister}
                ref={(e) => {
                  nameRegister.ref(e);
                  inputRef.current = e;
                }}
              ></input>
            </div>
            <button
              data-testid="srchbr-sbmt-btn"
              className="w-[24px] h-[24px] search-icon"
              aria-label="search"
            ></button>
          </form>

          {errors.name && (
            <div
              className={
                "absolute w-full left-0 bottom-[-100%] text-invalid" +
                " text-p p-[8px] bg-gr-black-100 rounded-b-[4px]"
              }
            >
              {errors.name.message}
            </div>
          )}
        </FormProvider>
      </div>
    </div>
  );
};

export default SearchBar;
