import { expect, it } from "vitest";

function toUpperCase(str: string): string {
  return str.toUpperCase();
}

it("toUpperCase", () => {
  const result = toUpperCase("foobar");
  expect(result).toMatchSnapshot();
});

it("toUpperCase", () => {
  const result = toUpperCase("foobar");
  expect(result).toMatchInlineSnapshot(`"FOOBAR"`);
});

it("render basic", async () => {
  const result = `<html><body><h1>Hello World</h1></body></html>`;
  await expect(result).toMatchFileSnapshot("./__snapshots__/basic.html");
});
