const t = require('tap')
const parse = require('csv-parse')
const fs = require('fs')
const { _parseTime, headerToKeys, parseRecords, parseCsv } = require('./parser')

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

t.test(t => {
  const seTime = '2019-05-08 17:22:06'
  const utcTime = _parseTime(seTime)
  t.equals(utcTime, '2019-05-08T15:22:06.000Z')
  t.done()
})

t.test(t => {
  const seTime = '2019-02-08 17:22:06'
  const utcTime = _parseTime(seTime)
  t.equals(utcTime, '2019-02-08T16:22:06.000Z')
  t.done()
})
