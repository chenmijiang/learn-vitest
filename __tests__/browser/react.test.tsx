import { expect, it } from "vitest";
import { render } from "vitest-browser-react";

function Hello({ name }: { name: string }) {
  return <h1>Hello, {name}!</h1>;
}

it("renders the greeting inside the browser", async () => {
  const screen = await render(<Hello name="Vitest" />);

  await expect
    .element(screen.getByRole("heading", { name: "Hello, Vitest!" }))
    .toBeVisible();
});
