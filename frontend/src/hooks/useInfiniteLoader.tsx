import { useEffect } from "react";

interface FetchNextPage {
  (): void;
}

interface UseInfiniteLoaderProps {
  ref: React.RefObject<HTMLElement | null>;
  fetchNextPage: FetchNextPage;
  threshold: number;
}

interface UseInfiniteLoader {
  ({ fetchNextPage, ref, threshold }: UseInfiniteLoaderProps): void;
}

const useInfiniteLoader: UseInfiniteLoader = ({
  ref,
  fetchNextPage,
  threshold,
}) => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      {
        threshold,
      }
    );

    const HTMLObserver = ref?.current;

    if (HTMLObserver) {
      observer?.observe(HTMLObserver);
    }

    return () => {
      if (HTMLObserver) {
        observer?.unobserve(HTMLObserver);
      }
    };
  }, [fetchNextPage]);
};

export default useInfiniteLoader;
