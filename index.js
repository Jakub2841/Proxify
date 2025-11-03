const fs = require("fs").promises;
const axios = require("axios");
const cheerio = require("cheerio");
const proxyChecker = require("proxy-checker");

// config
const proxySources = [
  "https://free-proxy-list.net/",
  "https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt",
];
const proxyListFile = "list.txt";
const verifiedProxyFile = "results.txt";
const testUrl = "http://www.google.com";

// scrape and parse

async function fetchFromFreeProxyList() {
  try {
    const { data } = await axios.get(proxySources[0]);
    const $ = cheerio.load(data);
    const proxies = [];

    $("table.table-striped tbody tr").each((_, element) => {
      const ip = $(element).find("td").eq(0).text().trim();
      const port = $(element).find("td").eq(1).text().trim();
      if (ip && port) proxies.push(`${ip}:${port}`);
    });

    console.log(`Fetched ${proxies.length} proxies from free-proxy-list.net`);
    return proxies;
  } catch (err) {
    console.error("Error fetching free-proxy-list:", err.message);
    return [];
  }
}

// fetch proxies
async function fetchFromGithubList() {
  try {
    const { data } = await axios.get(proxySources[1]);
    const proxies = data.split(/\r?\n/).filter((line) => line.trim() !== "");
    console.log(`Fetched ${proxies.length} proxies from GitHub`);
    return proxies;
  } catch (err) {
    console.error("Error fetching GitHub proxy list:", err.message);
    return [];
  }
}

// save proxies
async function saveProxyList(proxies) {
  try {
    await fs.writeFile(proxyListFile, proxies.join("\n"));
    console.log(`Saved ${proxies.length} proxies to ${proxyListFile}`);
  } catch (err) {
    console.error("Error saving proxy list:", err.message);
  }
}

// check if google can access
async function checkProxies() {
  return new Promise((resolve) => {
    proxyChecker.checkProxiesFromFile(
      proxyListFile,
      { url: testUrl },
      async (host, port, ok, statusCode) => {
        const proxy = `${host}:${port}`;
        if (ok && statusCode === 200) {
          try {
            await fs.appendFile(verifiedProxyFile, proxy + "\n");
            console.log("Verified:", proxy);
          } catch (err) {
            console.error("Error saving verified proxy:", err.message);
          }
        } else {
          console.log(`Failed: ${proxy} (Status: ${statusCode})`);
        }
      },
      () => {
        console.log("Proxy check completed.");
        resolve();
      }
    );
  });
}

async function main() {
  try {
    const proxies1 = await fetchFromFreeProxyList();
    const proxies2 = await fetchFromGithubList();
    const combinedProxies = Array.from(new Set([...proxies1, ...proxies2])); // removing double entries

    await saveProxyList(combinedProxies);
    await checkProxies();

    console.log("All done. Verified proxies saved to", verifiedProxyFile);
  } catch (err) {
    console.error("Unexpected error:", err.message);
  }
}

main();
