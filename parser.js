const parse = require('csv-parse')
const { Transform } = require('stream')
const stream = require('stream')
const transform = require('stream-transform')
const { constructN, evolve, prop, __, pipe, toLower, tap,
        map, identity, isNil, ifElse, replace, invoker, isEmpty,
        always } = require('ramda')

const parseTime = ifElse(
  isNil,
  identity,
  pipe(
    constructN(1, Date),
    invoker(0, 'toISOString')
  )
)

const emptyToNull = ifElse(
  isEmpty,
  always(null),
  identity
)

const columnToKey = {
  'Publiceringsdatum': 'published_at',
  'Utgivare': 'publisher',
  'LEI-kod': 'lei',
  'Anmälningsskyldig': 'responsible',
  'Person i ledande ställning': 'person',
  'Befattning': 'title',
  'Närstående': 'relative',
  'Korrigering': 'correction',
  'Beskrivning av korrigering': 'correction_reason',
  'Är förstagångsrapportering': 'first_report',
  'Är kopplad till aktieprogram': 'shares_program_connection',
  'Karaktär': 'transaction_type',
  'Instrumenttyp': 'instrument_type',
  'Instrumentnamn': 'instrument',
  'ISIN': 'isin',
  'Transaktionsdatum': 'created_at',
  'Volym': 'volume',
  'Volymsenhet': 'volume_unit',
  'Pris': 'price',
  'Valuta': 'currency',
  'Handelsplats': 'market',
  'Status': 'status'
}
const headerToKey = prop(__, columnToKey)
const headerToKeys = map(headerToKey)

const parseRecord = pipe(
  map(emptyToNull),
  evolve({
    published_at: parseTime,
    relative: seToBool,
    created_at: parseTime,
    correction: seToBool,
    first_report: seToBool,
    shares_program_connection: seToBool,
    volume: replace(/,/g, '.'),
    price: replace(/,/g, '.')
  })
)

function transformer(record, callback) {
  console.log(record)
  callback(null, parseRecord(record))
}

function seToBool (val) {
  switch(val) {
    case 'Ja':
      return true;
    case 'Nej':
      return false;
    default:
      return val;
  }
}

function parseRecords() {
  return transform(
    transformer,
    {
      parallel: 5
    }
  )
}

function parseCsv() {
  return parse({ 
    delimiter: ';',
    from: 1,
    columns: headerToKeys 
  })
}

module.exports = {
  parseRecords,
  parseCsv,
  headerToKeys
}
