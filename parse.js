import * as cheerio from "cheerio";
import { headers } from "./constants.js";

function getTableHeaders($) {
  const firstRow = $("tr")[0];

  const ths = $(firstRow).find("th");

  const tableHeaders = [];

  $(ths).each((_, element) => {
    const header = headers[$(element).text().toLowerCase()];

    tableHeaders.push(header);
  });

  return tableHeaders;
}

function getTableContent($) {
  const tableHeaders = getTableHeaders($);

  const content = [];

  $("tr").each((index, element) => {
    if (index > 0) {
      const tds = $(element).find("td");

      const tableRow = {};

      $(tds).each((index, element) => {
        tableRow[tableHeaders[index]] = $(element).text();
      });

      content.push(tableRow);
    }
  });

  return content;
}

export function parse(html) {
  const $ = cheerio.load(html);

  const tableContent = getTableContent($);

  return tableContent;
}
