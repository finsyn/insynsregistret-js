const { getEntries } = require('./fetcher')

getEntries('2017-09-10', '2017-09-15')
.then(console.log)
