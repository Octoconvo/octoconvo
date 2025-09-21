import {
  createHTMLNewLine,
  unescapeString,
  capitaliseStringFirstLetter,
  hasPath,
} from "@/utils/string";

test("Test unescape input return value", () => {
  const string = unescapeString("&#39;&#60;&#62;");

  expect(string).toEqual("'<>");
});

test("Test createHTMLNewLine", async () => {
  const element = createHTMLNewLine(
    "newlinetest1\nnewlinetest2\n"
  ) as React.JSX.Element;

  let newlinesCount = 0;

  const countNewLine = async () => {
    const countPromise = element.props.children.map((el: React.JSX.Element) => {
      return new Promise((resolve): void => {
        for (const child of el.props.children) {
          if (child.type === "br") {
            newlinesCount += 1;
          }
        }

        resolve(1);
      });
    });

    await Promise.all(countPromise);
  };

  await countNewLine();

  expect(newlinesCount).toBe(2);
});

test("Test capitaliseStringFirstLetter function", () => {
  const string = capitaliseStringFirstLetter("ECONOMY");

  expect(string).toBe("Economy");
});

describe("Test hasPath function", () => {
  test("Return false if the path is an empty string", () => {
    expect(hasPath({ path: "", toCompare: "testtocompare" })).toBe(false);
  });

  test("Return false if the toCompare is an empty string", () => {
    expect(hasPath({ path: "testpath", toCompare: "" })).toBe(false);
  });

  test("Return false if the toCompare and path are an empty strings", () => {
    expect(hasPath({ path: "testpath", toCompare: "" })).toBe(false);
  });

  test("Return true if the path contains toCompare path", () => {
    const hasToComparePath = hasPath({
      path: "/testpath/testtocompare/",
      toCompare: "testtocompare",
    });
    expect(hasToComparePath).toBe(true);
  });
});
