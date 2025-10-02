import { Counter } from "@/utils/tests/helpers";

describe("Test Counter class", () => {
  const counter = new Counter();

  test("Counter shold be initialised with 0", () => {
    expect(counter.count).toBe(0);
  });

  test("Counter shold be 1 after invoking its increment method", () => {
    counter.increment();
    expect(counter.count).toBe(1);
  });

  test("Counter shold be 3 after invoking its increment method 3 times", () => {
    counter.increment();
    counter.increment();
    expect(counter.count).toBe(3);
  });

  test("Counter shold be 0 after invoking its reset method", () => {
    counter.reset();
    expect(counter.count).toBe(0);
  });
});
