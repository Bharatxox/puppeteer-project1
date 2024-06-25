// const puppeteer = require("puppeteer");
// const fs = require("fs");
// const path = require("path");

// // import puppeteer from "puppeteer";

// (async () => {
//   // Launch the browser and open a new blank page
//   const browser = await puppeteer.launch({
//     headless: false,
//     defaultViewport: false,
//     // userDataDir: ""
//   });
//   const page = await browser.newPage();
//   await page.goto(
//     // "https://www.amazon.in/s?k=ear+buds&crid=1CYU81N4VMCKN&sprefix=ear+buds%2Caps%2C253&ref=nb_sb_ss_ts-doa-p_2_8",
//     "https://www.amazon.in/s?k=shark+blanket&crid=220PSXGZ3B856&sprefix=shark+bl%2Caps%2C265&ref=nb_sb_ss_ts-doa-p_1_8",
//     {
//       waitUntil: "load",
//     }
//   );

//   let items = [];

//   let isBtnDisabled = false;
//   while (!isBtnDisabled) {
//     await page.waitForSelector('[data-cel-widget="search_result_0"]');
//     const productHandles = await page.$$(
//       " div.s-main-slot.s-result-list.s-search-results.sg-row > .s-result-item "
//     );
//     for (const productHandle of productHandles) {
//       let title = "NULL";
//       let price = "NULL";
//       let image = "NULL";
//       try {
//         title = await page.evaluate(
//           (el) => el.querySelector(" h2 > a > span ").textContent,
//           productHandle
//         );
//       } catch (error) {}
//       // console.log(element);
//       try {
//         price = await page.evaluate(
//           (el) => el.querySelector(" .a-price > span ").textContent,
//           productHandle
//         );
//       } catch (error) {}

//       try {
//         image = await page.evaluate(
//           (el) => el.querySelector(".s-image").getAttribute("src"),
//           productHandle
//         );
//       } catch (error) {}
//       if (title !== "NULL") {
//         items.push({ title, price, image });
//       }
//       // handle click event on button of next

//       // fs.writeFileSync(
//       //   path.join(__dirname, "data.json"),
//       //   JSON.stringify(item),
//       //   "utf8"
//       // );
//     }
//     await page.waitForSelector(".s-pagination-next", { visible: true });
//     const is_disabled =
//       (await page.$(
//         "span.s-pagination-item.s-pagination-next.s-pagination-disabled"
//       )) !== null;
//     isBtnDisabled = is_disabled;
//     if (!isBtnDisabled) {
//       await page.click(".s-pagination-next");
//       await page.waitForSelector({ waitUntil: "networkidle2" });
//     }
//   }
//   console.log(items);
//   console.log(items.length);
//   // await browser.close();
// })();

const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

(async () => {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });
  const page = await browser.newPage();
  await page.goto(
    "https://www.amazon.in/s?k=shark+blanket&crid=220PSXGZ3B856&sprefix=shark+bl%2Caps%2C265&ref=nb_sb_ss_ts-doa-p_1_8",
    {
      waitUntil: "load",
    }
  );

  let items = [];
  let isBtnDisabled = false;

  while (!isBtnDisabled) {
    await page.waitForSelector('[data-cel-widget="search_result_0"]', {
      timeout: 10000,
    });

    const productHandles = await page.$$(
      "div.s-main-slot.s-result-list.s-search-results.sg-row > .s-result-item"
    );

    for (const productHandle of productHandles) {
      let title = "NULL";
      let price = "NULL";
      let image = "NULL";

      try {
        title = await page.evaluate(
          (el) => el.querySelector("h2 > a > span")?.textContent || "NULL",
          productHandle
        );
      } catch (error) {
        console.error("Error getting title:", error);
      }

      try {
        price = await page.evaluate(
          (el) => el.querySelector(".a-price > span")?.textContent || "NULL",
          productHandle
        );
      } catch (error) {
        console.error("Error getting price:", error);
      }

      try {
        image = await page.evaluate(
          (el) => el.querySelector(".s-image")?.getAttribute("src") || "NULL",
          productHandle
        );
      } catch (error) {
        console.error("Error getting image:", error);
      }

      if (title !== "NULL") {
        items.push({ title, price, image });
      }
    }

    try {
      await page.waitForSelector(".s-pagination-next", {
        visible: true,
        timeout: 5000,
      });
      const is_disabled =
        (await page.$(
          "span.s-pagination-item.s-pagination-next.s-pagination-disabled"
        )) !== null;
      isBtnDisabled = is_disabled;

      if (!isBtnDisabled) {
        await Promise.all([
          page.click(".s-pagination-next"),
          page.waitForNavigation({ waitUntil: "networkidle2" }),
        ]);
      }
    } catch (error) {
      console.error("Error with pagination:", error);
      isBtnDisabled = true;
    }
  }

  // console.log(items);
  console.log(items.length);
  fs.writeFileSync(
    path.join(__dirname, "sharkBlanket.json"),
    JSON.stringify(items, null, 2),
    "utf8"
  );
  await browser.close();
})();
