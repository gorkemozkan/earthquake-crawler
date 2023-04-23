import fetch from "node-fetch";
import { parser } from "./parser.js";

export async function crawl({ url }) {
  console.log("Crawling to :", url);

  try {
    const response = await fetch(url);

    const contentType = response.headers.get("content-type");

    if (response.status > 399) {
      console.log(
        `Error occured in fetch with status code : ${response.status} on ${url}`
      );

      return;
    }

    if (contentType !== "text/html") {
      console.log(
        `No HTML response found, content type ${contentType} on ${url}`
      );

      return;
    }

    const html = await response.text();

    const scrapedData = parser(html);

    return scrapedData;
  } catch (error) {
    console.log(
      `Error occured in fetch with status code : ${error.message} on ${url}`
    );
  }
}
