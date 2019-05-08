const qs = require('querystring')
const https = require('https')
const parseCsv = require('./parser')

// (String, [String]) -> Promise(Object[])
function getEntries (from, to=null) {

  const params = {
    SearchFunctionType: 'Insyn',
    'Publiceringsdatum.From': from,
    'Publiceringsdatum.To': to || from,
    button: 'export',
    Page: '1' // apparently this needs to be specified since 24th of March 2017
  }

  const queryString = qs.stringify(params)

  const url = `https://marknadssok.fi.se/publiceringsklient/sv-SE/Search/Search?${queryString}`

  const entries = []
  return new Promise((resolve, reject) => {
    https.get(url, function(response) {
      response
        .setEncoding('ucs2') // works for utf-16 encoding of input
        .pipe(
            parse({ 
              delimiter: ';',
              from: 1,
              columns: headerToKeys 
            })
          )


        .on('error', reject)
        .on('end', resolve)
    })
  })
}

 module.exports = {
   getEntries
 }
