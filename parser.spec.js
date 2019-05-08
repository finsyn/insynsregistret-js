const t = require('tap')
const parse = require('csv-parse')
const fs = require('fs')
const { headerToKeys, parseRecords, parseCsv } = require('./parser')

fs.createReadStream('mocks/insyn.csv')
  .setEncoding('ucs2') // works for utf-16 encoding of input
  .pipe(parseCsv())
  .pipe(parseRecords())
  .on('data', d => console.log(d))
