import fetch from "node-fetch";
import * as cheerio from "cheerio";
import { headers } from "./constants.js";

export async function crawl({ url }) {
  const pageHTML = await fetch(url).then((response) => response.text());

  const $ = cheerio.load(pageHTML);

  const scrapedData = [];
  const tableHeaders = [];

  $("tr").each((index, element) => {
    // first index always header row
    if (index === 0) {
      const ths = $(element).find("th");

      $(ths).each((_, element) => {
        const header = headers[$(element).text().toLowerCase()];

        tableHeaders.push(header);
      });
    } else {
      const tds = $(element).find("td");

      const tableRow = {};

      $(tds).each((index, element) => {
        tableRow[tableHeaders[index]] = $(element).text();
      });

      scrapedData.push(tableRow);
    }
  });

  return scrapedData;
}
