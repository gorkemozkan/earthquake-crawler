import { crawl } from "./crawl.js";
import { url } from "./constants.js";

async function main() {
  const tableData = await crawl({
    url,
  });

  console.log(tableData);
}

main().catch((error) => {
  console.log(error);
});
