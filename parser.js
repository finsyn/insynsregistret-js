const parse = require('csv-parse')
const { Transform } = require('stream')
const stream = require('stream')
const transform = require('stream-transform')
const { constructN, evolve, prop, __, pipe, toLower, tap,
  map, identity, isNil, ifElse, replace, invoker, isEmpty,
  always, propOr, multiply, split } = require('ramda')
const tz = require('timezone')
const seTz = tz(require('timezone/Europe/Stockholm'))(__, "Europe/Stockholm")
const instrumentTypes = require('./instrument-types')

const parseTime = ifElse(
  isNil,
  identity,
  pipe(
    split(' '),
    ([date, time]) => `${date.split('/').reverse().join('-')}T${time}`,
    seTz,
    constructN(1, Date)
  )
)

const emptyToNull = ifElse(
  isEmpty,
  always(null),
  identity
)

const columnToKey = {
  'Publication date': 'publishedAt',
  'Issuer': 'publisher',
  'LEI-code': 'publisherLei',
  'Notifier': 'responsible',
  'Person discharging managerial responsibilities': 'person',
  'Position': 'title',
  'Closely associated': 'isAssociated',
  'Amendment': 'isCorrection',
  'Details of amendment': 'correctionReason',
  'Initial notification': 'isFirstReport',
  'Linked to share option programme': 'isSharesProgramConnected',
  'Nature of transaction': 'transactionType',
  // this is actually misspelled, will email them
  'Intrument type': 'instrumentType',
  'Instrument name': 'instrument',
  'ISIN': 'isin',
  'Transaction date': 'transactionAt',
  'Volume': 'volume',
  'Unit': 'volumeUnit',
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
    publishedAt: parseTime,
    isAssociated: enToBool,
    transactionAt: parseTime,
    isCorrection: enToBool,
    isFirstReport: enToBool,
    isSharesProgramConnection: enToBool,
    volume: replace(/,/g, '.'),
    instrumentType: propOr('Unknown', __, instrumentTypes)
  })
)

function transformer(record, callback) {
  callback(null, parseRecord(record))
}

function enToBool (val) {
  switch(val) {
    case 'Yes':
      return true;
    // null implies false
    default:
      return false
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
