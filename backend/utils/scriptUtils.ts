type SeedUser = {
  username: string;
  displayName: string;
  password: string;
  community: string;
};

const generateArrayOfSeedUsers = (size: number): SeedUser[] => {
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

export { generateArrayOfSeedUsers };
