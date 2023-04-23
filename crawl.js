import fetch from "node-fetch";
import { parser } from "./parser.js";

export async function crawl({ url }) {
  const pageHTML = await fetch(url).then((response) => response.text());

  const scrapedData = parser(pageHTML);

  return scrapedData;
}
