function unescapeString(input: string): string {
  const doc = new DOMParser().parseFromString(input, "text/html");
  const decodedInput = doc.documentElement.textContent
    ? doc.documentElement.textContent
    : "";
  return decodedInput;
}

export { unescapeString };
