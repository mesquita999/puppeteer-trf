const puppeteer = require('puppeteer')
let scrape = async () => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto('http://books.toscrape.com/')
  page.click('h3 > a')
  await page.waitForNavigation()
  //await page.waitForTimeout(1000);
//   await page.waitForFunction(
//     'document.querySelector("body").innerText.includes("Carregado!")'
//   );
  await page.screenshot({ path: 'example3.png' })
  const result = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('div.product_main')).reduce(
      (result, book) => {
        return {
          title: book.getElementsByTagName('h1')[0].innerText,
          price: book.getElementsByClassName('price_color')[0].innerText,
        }
      }, {})
  })
  browser.close()
  return result
}
scrape().then((value) => {
  console.log(value)
})