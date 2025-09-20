import { SeedUserGenerator } from "../@types/scriptTypes";

const generateSeedUserGenerators = (size: number): SeedUserGenerator[] => {
  const seedUsers = [];

  for (let i = 1; i <= size; i++) {
    const user = {
      username: `seeduser${i}`,
      displayName: `seeduser${i}`,
      password: `seed@User${i}`,
      community: `seedcommunity${i}`,
    };

    seedUsers.push(user);
  }

  return seedUsers;
};

const generateClientUserGenerators = (size: number): SeedUserGenerator[] => {
  const clientUsers = [];

  for (let i = 1; i <= size; i++) {
    const user = {
      username: `clientuser${i}`,
      displayName: `clientuser${i}`,
      password: `client@User${i}`,
      community: `clientcommunity${i}`,
    };

    clientUsers.push(user);
  }

  return clientUsers;
};

export { generateSeedUserGenerators, generateClientUserGenerators };
