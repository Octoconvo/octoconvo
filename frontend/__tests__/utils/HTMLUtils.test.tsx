import { createHTMLNewLine } from "@/utils/HTMLUtils";

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
