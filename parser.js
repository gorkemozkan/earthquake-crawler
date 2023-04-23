import * as cheerio from "cheerio";
import { headers } from "./constants.js";

export function parser(html) {
  const $ = cheerio.load(html);

  const scrapedData = [];
  const tableHeaders = [];

  $("tr").each((index, element) => {
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
