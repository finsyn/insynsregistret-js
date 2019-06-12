const parse = require('csv-parse')
const { Transform } = require('stream')
const stream = require('stream')
const transform = require('stream-transform')
const { constructN, evolve, prop, __, pipe, toLower, tap,
  map, identity, isNil, ifElse, replace, invoker, isEmpty,
  always, propOr, multiply, split } = require('ramda')
const tz = require('timezone')
const seTz = tz(require('timezone/Europe/Stockholm'))(__, "Europe/Stockholm")

const parseTime = ifElse(
  isNil,
  identity,
  pipe(
    split(' '),
    ([date, time]) => `${date.split('/').reverse().join('-')}T${time}`,
    seTz,
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
  'Publication date': 'published_at',
  'Issuer': 'publisher',
  'LEI-code': 'lei',
  'Notifier': 'responsible',
  'Person discharging managerial responsibilities': 'person',
  'Position': 'title',
  'Closely associated': 'relative',
  'Amendment': 'correction',
  'Details of amendment': 'correction_reason',
  'Initial notification': 'first_report',
  'Linked to share option programme': 'shares_program_connection',
  'Nature of transaction': 'transaction_type',
  'Instrument type': 'instrument_type',
  'Instrument name': 'instrument',
  'ISIN': 'isin',
  'Transaction date': 'created_at',
  'Volume': 'volume',
  'Unit': 'volume_unit',
  'Price': 'price',
  'Currency': 'currency',
  'Trading venue': 'market',
  'Status': 'status',
}
// skip columns we havent declared explicitly
const headerToKey = propOr(false, __, columnToKey)
const headerToKeys = map(headerToKey)

const parseRecord = pipe(
  map(emptyToNull),
  evolve({
    published_at: parseTime,
    relative: enToBool,
    created_at: parseTime,
    correction: enToBool,
    first_report: enToBool,
    shares_program_connection: enToBool,
    volume: replace(/,/g, '.'),
    price: replace(/,/g, '.')
  })
)

function transformer(record, callback) {
  callback(null, parseRecord(record))
}

function enToBool (val) {
  switch(val) {
    case 'Yes':
      return true;
    case 'No':
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
    columns: headerToKeys,
    trim: true
  })
}

module.exports = {
  parseRecords,
  parseCsv,
  headerToKeys,
  _parseTime: parseTime
}
