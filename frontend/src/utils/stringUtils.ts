function unescapeString(input: string): string {
  const doc = new DOMParser().parseFromString(input, "text/html");
  const decodedInput = doc.documentElement.textContent
    ? doc.documentElement.textContent
    : "";
  return decodedInput;
}

const capitaliseStringFirstLetter = (input: string) => {
  return input
    .toLowerCase()
    .split("")
    .map((char, index) => {
      return index === 0 ? char.toUpperCase() : char;
    })
    .join("");
};

type HasPath = {
  path: string | null;
  toCompare: string;
};

const hasPath = ({ path, toCompare }: HasPath): boolean => {
  if (path === null) {
    return false;
  }
  return path.split("/").includes(toCompare);
};

export { unescapeString, capitaliseStringFirstLetter, hasPath };
