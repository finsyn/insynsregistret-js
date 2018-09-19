const qs = require('querystring');
const https = require('https');
const parse = require('csv-parse');

// (String, [String]) -> Promise(Object[])
function getEntries (from, to=null) {

  const params = {
    SearchFunctionType: 'Insyn',
    'Publiceringsdatum.From': from,
    'Publiceringsdatum.To': to || from,
    button: 'export',
    Page: '1' // apparently this needs to be specified since 24th of March 2017
  };

  const queryString = qs.stringify(params);

  const url = `https://marknadssok.fi.se/publiceringsklient/sv-SE/Search/Search?${queryString}`;

  return new Promise((resolve, reject) => {
    https.get(url, function(response) {
      response
        .setEncoding('ucs2') // works for utf-16 encoding of input
        .pipe(
          parse({delimiter: ';'}, (err, data) => {
            if (err) { reject(`Error in parsing CSV: ${JSON.stringify(err)}`); }
            resolve(parseEntries(data));
          })
        );
    })
  });
}

function parseEntries (data) {

  const emptyToNull = (val) => (val === '') ? null : val;
  const seToBool = (val) => {
    switch(val) {
    case 'Ja':
      return true;
    case 'Nej':
      return false;
    default:
      return val;
    }
  }
  
  return data.slice(1)
    .map(vals => vals.map(emptyToNull))
    .map(vals => vals.map(seToBool))
    .map(([
      published_at, // 0
      publisher,
      lei,
      responsible,
      person,
      title, // 5
      relative,
      correction,
      correction_reason,
      first_report,
      shares_program_connection, // 10
      transaction_type,
      instrument_type,
      instrument,
      isin,
      created_at,
      volume, // 15
      volume_unit,
      price,
      currency,
      market,
      status
    ]) => ({
      published_at: (published_at) ? new Date(published_at).toISOString() : null,
      publisher,
      lei,
      responsible,
      person,
      title,
      relative,
      created_at: (created_at) ? new Date(created_at).toISOString() : null,
      correction,
      correction_reason,
      first_report,
      shares_program_connection,
      transaction_type,
      instrument_type,
      instrument,
      isin,
      volume_unit,
      volume: volume.replace(/,/g, '.'),
      price: price.replace(/,/g, '.'),
      currency,
      market,
      status
    }));
}

 module.exports = {
   getEntries
 }
