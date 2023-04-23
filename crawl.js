import fetch from "node-fetch";
import { parser } from "./parser.js";
import { errorHandler } from "./errorHandler.js";

export async function crawl({ url }) {
  try {
    const response = await fetch(url);

    const html = await response.text();

    return parser(html);
  } catch (error) {
    errorHandler(error);
  }
}
