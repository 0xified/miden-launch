// Visual smoke test: screenshot the page at each act's midpoint and
// surface any console errors. Run: node scripts/shoot.mjs [url]
import puppeteer from "puppeteer-core";

const url = process.argv[2] ?? "http://localhost:4321";
const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: "new",
  args: ["--use-angle=metal", "--hide-scrollbars"],
});

const page = await browser.newPage();
const errors = [];
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});
page.on("pageerror", (e) => errors.push(String(e)));

await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });
await new Promise((r) => setTimeout(r, 1500));

// midpoint of each act as fraction of scrollable height
const stops = [
  ["act1", 0.06],
  ["act2-assemble", 0.27],
  ["act3-strain", 0.46],
  ["act3-lattice", 0.56],
  ["act4-field", 0.7],
  ["act5-finale", 0.97],
];

for (const [name, frac] of stops) {
  await page.evaluate((f) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo(0, max * f);
  }, frac);
  // let Lenis catch up and the lerped uniforms settle
  await new Promise((r) => setTimeout(r, 2600));
  await page.screenshot({ path: `/tmp/miden-${name}.png` });
  console.log(`shot: ${name}`);
}

const gl = await page.evaluate(() => {
  const c = document.querySelector("canvas");
  return c ? `${c.width}x${c.height}` : "NO CANVAS";
});
console.log("canvas:", gl);
console.log("console errors:", errors.length ? errors : "none");
await browser.close();
