import { crawl } from "./crawl.js";
import { url } from "./constants.js";

async function main() {
  const crawledData = await crawl({
    url,
  });

  return crawledData;
}

main();
