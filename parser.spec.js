const t = require('tap')
const parse = require('csv-parse')
const fs = require('fs')
const { headerToKeys, parseRecords, parseCsv } = require('./parser')

t.test(t => {
  let count = 0
  fs.createReadStream('mocks/insyn.csv')
    .pipe(parseCsv())
    .pipe(parseRecords())
    .on('data', d => {
      const olderDate = new Date('2019-01-01')
      t.type(d, 'object')
      t.type(d['transaction_type'], 'string')
      t.ok(new Date(d['published_at']) > olderDate) 
      t.ok(new Date(d['created_at']) > olderDate) 
      t.ok(/[A-Z0-9]{20}/.test(d['lei']))
      t.equals(d['currency'], 'SEK')
      count += 1
    })
    .on('end', () => {
      t.equals(count, 9)
      t.done()
    })
})
