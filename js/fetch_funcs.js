const puppeteer = require("puppeteer")

async function returnXPathValue(_pageURL, _xPath, _property) {
  try {
    await _pageURL.waitForXPath(_xPath, { visible: true, timeout: 5000 })
    let [el0] = await _pageURL.$x(_xPath)
    let link0 = await el0.getProperty(_property)

    return await link0.jsonValue()
  } catch {
    return ""
  }
}

async function getLinkItems(categoryJson, count, category) {
  let linkItems = []
  //var browser = await puppeteer.launch();
  var browser = await puppeteer.launch({
    //executablePath: '/usr/bin/chromium-browser',
    args: ["--no-sandbox"],
  })

  //const browser = await puppeteer.launch({
  //    args: [
  //        '--no-sandbox',
  //        '--disable-setuid-sandbox'
  //    ]
  //});

  var pageURL = await browser.newPage()
  console.log("get url ::: ", categoryJson.Url)
  await pageURL.goto(categoryJson.Url)
  for (let i = 0; i < count; i++) {
    linkItems[i] = {}
    linkItems[i].link = await returnXPathValue(
      pageURL,
      categoryJson.link_xpath[i],
      "href"
    )
    linkItems[i].pos = i + 1
    linkItems[i].cat = category
  }
  browser.close()
  console.log(linkItems)
  return linkItems
  //console.log(linkItems);
}

module.exports = {
  getLinkItems,
  returnXPathValue,
}
