import { crawl } from "./crawl.js";

async function main() {
  const tableData = await crawl({
    url: "https://deprem.afad.gov.tr/last-earthquakes.html",
  });

  console.log(tableData);
}

main().catch((error) => {
  console.log(error);
});
