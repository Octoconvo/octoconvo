import { generateSeedUserGenerators } from "../../utils/scriptUtils";

describe("Test createSeedUsergenerators function", () => {
  test("Return 10 seedUserGenerators", () => {
    const seedUserGenerators = generateSeedUserGenerators(10);
    expect(seedUserGenerators.length).toBe(10);
  });

  test("Return correct seedUserGenerators' usernames", () => {
    const seedUserGenerators = generateSeedUserGenerators(10);
    for (let i = 0; i < 10; i++) {
      expect(seedUserGenerators[i].username).toBe(`seeduser${i + 1}`);
    }
  });

  test("Return correct seedUserGenerators' displayNames", () => {
    const seedUserGenerators = generateSeedUserGenerators(10);
    for (let i = 0; i < 10; i++) {
      expect(seedUserGenerators[i].displayName).toBe(`seeduser${i + 1}`);
    }
  });

  test("Return correct seedUserGenerators' communities", () => {
    const seedUserGenerators = generateSeedUserGenerators(10);
    for (let i = 0; i < 10; i++) {
      expect(seedUserGenerators[i].community).toBe(`seedcommunity${i + 1}`);
    }
  });

  test("Return correct seedUserGenerators' passwords", () => {
    const seedUserGenerators = generateSeedUserGenerators(10);
    for (let i = 0; i < 10; i++) {
      expect(seedUserGenerators[i].password).toBe(`seed@User${i + 1}`);
    }
  });
});
