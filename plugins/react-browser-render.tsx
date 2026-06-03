import React from "react";
import * as ReactDOMClient from "react-dom/client";
import { page, utils } from "vitest/browser";
import type { LocatorSelectors, Locator } from "vitest/browser";

const { getElementLocatorSelectors } = utils;

interface RenderResult extends LocatorSelectors {
  locator: Locator;
}

export async function renderReact(ui: React.ReactNode): Promise<RenderResult> {
  const baseElement = document.body;
  const container = baseElement.appendChild(document.createElement("div"));

  const root = ReactDOMClient.createRoot(container);

  root.render(ui);

  const locator = page.elementLocator(container);

  return {
    locator,
    ...getElementLocatorSelectors(baseElement),
  };
}
