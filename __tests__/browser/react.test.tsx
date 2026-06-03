import { expect, it } from "vitest";
import { renderReact } from "../../plugins/react-browser-render";

function Hello({ name }: { name: string }) {
  return <h1>Hello, {name}!</h1>;
}

it("renders the greeting inside the browser", async () => {
  const screen = await renderReact(<Hello name="Vitest" />);

  await expect
    .element(screen.getByRole("heading", { name: "Hello, Vitest!" }))
    .toBeVisible();

  await expect(screen.getByRole("heading")).toMatchSnapshot();
});
