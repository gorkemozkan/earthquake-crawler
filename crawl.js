import fetch from "node-fetch";
import { parse } from "./parse.js";
import { errorHandler } from "./errorHandler.js";

export async function crawl({ url }) {
  try {
    const response = await fetch(url);

    const html = await response.text();

    const parsed = parse(html);

    debugger;
    return parsed;
  } catch (error) {
    errorHandler(error);
  }
}
