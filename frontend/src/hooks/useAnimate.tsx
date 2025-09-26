import { useEffect, useState } from "react";

interface UseAnimateProps {
  ref: null | React.RefObject<HTMLElement | null>;
  onAnimateStart: () => void;
  onAnimateEnd: () => void;
}

const useAnimate = ({ ref, onAnimateStart, onAnimateEnd }: UseAnimateProps) => {
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  useEffect(() => {
    const animateStart = () => {
      setIsAnimating(true);
      onAnimateStart();
    };

    const animateEnd = () => {
      setIsAnimating(false);
      onAnimateEnd();
    };

    const HTMLElement = ref?.current;
    HTMLElement?.addEventListener("animationstart", animateStart);
    HTMLElement?.addEventListener("animationend", animateEnd);

    return () => {
      HTMLElement?.removeEventListener("animationstart", animateStart);
      HTMLElement?.removeEventListener("animationend", animateEnd);
    };
  }, [isAnimating]);
};

export default useAnimate;
