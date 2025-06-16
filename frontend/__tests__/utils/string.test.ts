import { unescapeString } from "@/utils/string";

test("Test unescape input return value", () => {
  const string = unescapeString("&#39;&#60;&#62;");

  expect(string).toEqual("'<>");
});
