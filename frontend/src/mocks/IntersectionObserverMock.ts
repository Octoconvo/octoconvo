import { removeItemFromArray } from "@/utils/arrayUtils";

interface Entry {
  el: HTMLElement;
  isIntersecting: boolean;
}

interface Options {
  threshold: number;
}

interface Callback {
  (entries: Entry[]): void;
}

interface Observe {
  (el: HTMLElement): void;
}

interface Unobserve {
  (el: HTMLElement): void;
}

interface Disconnect {
  (): void;
}

interface IntersectionObserverMockI {
  observe: Observe;
  unobserve: Unobserve;
  disconnect: Disconnect;
}

const updateIsIntersecting = (
  entries: Entry[],
  el: HTMLElement,
  isIntersecting: boolean
) => {
  entries.find((entry: Entry) => {
    if (el == entry.el) {
      entry.isIntersecting = isIntersecting;
    }
  });
};

class IntersectionObserverMock implements IntersectionObserverMockI {
  private entries: Entry[] = [];
  private options: Options;
  private callback: Callback;

  constructor(callback: Callback, options: Options) {
    this.callback = callback;
    this.options = options;
  }

  observe(el: HTMLElement) {
    this.entries.push({
      el: el,
      isIntersecting: false,
    });

    el.addEventListener("mouseenter", () => {
      updateIsIntersecting(this.entries, el, true);
      this.callback(this.entries);
    });
    el.addEventListener("mouseleave", () => {
      updateIsIntersecting(this.entries, el, false);
      this.callback(this.entries);
    });
  }

  unobserve(el: HTMLElement) {
    el.removeEventListener("mouseenter", () => {
      updateIsIntersecting(this.entries, el, true);
      this.callback(this.entries);
    });
    el.removeEventListener("mouseleave", () => {
      updateIsIntersecting(this.entries, el, false);
      this.callback(this.entries);
    });
    this.removeEntry(el);
  }

  disconnect() {}

  private removeEntry(el: HTMLElement) {
    const item = this.entries.find((entry) => entry.el === el);
    if (item) {
      removeItemFromArray<Entry>(this.entries, item);
    }
  }
}

export default IntersectionObserverMock;
