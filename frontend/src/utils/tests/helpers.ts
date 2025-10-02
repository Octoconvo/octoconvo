interface Increment {
  (): void;
}

interface Reset {
  (): void;
}

interface CounterI {
  count: number;
  increment: Increment;
  reset: Reset;
}

class Counter implements CounterI {
  count: number = 0;

  constructor() {
    this.count = 0;
  }

  increment() {
    this.count++;
  }

  reset() {
    this.count = 0;
  }
}

export { Counter };
