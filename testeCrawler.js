require('dotenv/config')
const puppeteer = require('puppeteer-extra')
const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha')

const {
  TRF3_MAIN_URL,
  USER_AGENT,
  BACKGROUND_NAVIGATION,
  CAPTCHA_TOKEN,
} = process.env

puppeteer.use(
  RecaptchaPlugin({
    provider: {
      id: '2captcha',
      token: CAPTCHA_TOKEN,
    },
    visualFeedback: true, // colorize reCAPTCHAs (violet = detected, green = solved)
    /** Throw on errors instead of returning them in the error property */
    throwOnError: true, // default: false
    /** Only solve captchas and challenges visible in the browser viewport */
    solveInViewportOnly: true, // default: false
    /** Solve scored based captchas with no challenge (e.g. reCAPTCHA v3) */
    solveScoreBased: false, // default: false
    /** Solve invisible captchas that have no active challenge */
    solveInactiveChallenges: false // default: false
  })
)

const main = async () => {
  const browser = await puppeteer.launch({
      headless: BACKGROUND_NAVIGATION,
      defaultViewport: null,
      args: [
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--flag-switches-begin --disable-site-isolation-trials --flag-switches-end'
      ]
  })
  const page = await browser.newPage()
  await page.setViewport({
    width: 1366,
    height: 768,
  });
  //await page.setDefaultNavigationTimeout(180000);
  await page.setUserAgent(USER_AGENT)
  await page.setJavaScriptEnabled(true)
  await page.goto(`${TRF3_MAIN_URL}`)

  await page.waitForFunction(
    'document.querySelector("body").innerText.includes("CNPJ")'
  )

  await page.$$eval('input[name=tipoMascaraDocumento]', checks => checks.forEach(c =>
    c.checked = c.checked == true ? false : true
  ))
  
  await page.waitForTimeout(100)
  await page.$eval('[id$=documentoParte]', e => e.value = '06.242.066/0001-74')
  //await page.type('[id$=documentoParte]', '06.242.066/0001-74', { delay: 50 })
  await page.click('[id$=searchProcessos]')
  await page.waitForSelector('iframe[src*="captcha/"]')
  await page.waitForTimeout(1000)

  await page.screenshot({ path: 'screenshot/trf3-inicio.png' })

  console.log(await page.evaluate(() => document.querySelectorAll('iframe').length));
    console.log((await page.frames()));
//   console.log('aqui')
  for (const frame of page.mainFrame()) {
    // Attempt to solve any potential captchas in those frames
    const { captchas, solutions, solved, error } = await frame.solveRecaptchas()
    console.log(captchas, solutions, solved, error)
  }

  //const { captchas, solutions, solved, error } = await page.solveRecaptchas()
  //console.log(captchas, solutions, solved, error)
  await page.waitForNavigation()

  await page.screenshot({ path: 'screenshot/trf3-inicio.png' })
  

//   await Promise.all([
//     page.waitForNavigation(), 
//     //page.click('[id$=searchProcessos]'),
//     page.solveRecaptchas()
//   ])

  

    //await page.goto(`${CEI_MAIN_URL}/ConsultarCarteiraAtivos.aspx`)

    

//   await page.click('#ctl00_ContentPlaceHolder1_btnConsultar')

//   await Promise.all([
//     page.waitForResponse(`${CEI_MAIN_URL}/ConsultarCarteiraAtivos.aspx`),
//     page.click('#ctl00_ContentPlaceHolder1_btnConsultar'),
//   ])

//   await page.waitForTimeout(1000)

//   const result = await page.evaluate(() => {
//     const columnsTitle = []
//     const stocks = []

//     document
//       .querySelector(
//         'table[id^=ctl00_ContentPlaceHolder1_rptAgenteContaMercado_ctl0] thead > tr'
//       )
//       .querySelectorAll('th')
//       .forEach(column => {
//         columnsTitle.push(column.innerText)
//       })

//     document
//       .querySelectorAll(
//         'table[id^=ctl00_ContentPlaceHolder1_rptAgenteContaMercado_ctl0] tbody tr'
//       )
//       .forEach(stock => {
//         let newObject = {}

//         stock.querySelectorAll('td').forEach((value, index) => {
//           newObject[columnsTitle[index]] = value.innerText
//         })

//         stocks.push(newObject)
//       })

//     return stocks
//  })

//  console.log(result)

  await browser.close()
}

main()