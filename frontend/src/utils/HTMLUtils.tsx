const createHTMLNewLine = (input: string) => {
  const strings = input.split("\n");
  const newlines = [...input.matchAll(/\n/g)];

  const content = strings.map((string, index) => {
    if (index < newlines.length) {
      return (
        <p key={index}>
          {string}
          <br key={index} />
        </p>
      );
    } else {
      return <p key={index}>{string}</p>;
    }
  });

  return <>{content}</>;
};

export { createHTMLNewLine };
