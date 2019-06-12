## Insynsregistret-js

Fetches insider transactions published in [Insynsregistret](http://www.fi.se/en/our-registers/pdmr-transactions/).

>Persons discharging managerial responsibilities (PDMRs) and persons closely associated with them are required, under MAR Article 19, to notify FI of certain transactions in or related to the issuer's financial instruments conducted on their own account and once a total amount of EUR 5,000 has been reached. Such notification shall be made promptly and no later than three business days.

>The notifications are directly published in FI's web site. In the PDMR transactions register you can search by issuer, PDMR, transaction date and a publication date.

### Installation
```bash
npm i insynsregistret
```

### Example
```javascript
const ir = require('insynsregistret')

// get transactions published on a given date
ir('2017-01-10')
.then(console.log)

// [ { publishedAt: '2017-09-10T18:27:58.000Z',
//     publisher: 'Företag AB',
//     lei: '549300I1FSPPU9HHU419',
//     responsible: 'Sverre Svansson',
//     person: 'Sven Svensson',
//     title: 'Styrelseordförande',
//     relative: true,
//     createdAt: '2017-09-06T22:00:00.000Z',
//     correction: null,
//     correction_reason: null,
//     firstReport: true,
//     sharesProgramConnection: null,
//     transactionType: 'Acquisition',
//     instrument: 'Företag B',
//     instrumentType: 'Share',
//     isin: 'SE0007439442',
//     volumeUnit: 'Quantity',
//     volume: '7400',
//     price: '67.5',
//     currency: 'SEK',
//     market: 'EXEMPELMARKNAD',
//     status: 'Current' },
//     ...
// ]

// get transactions published between two dates
ir('2017-01-01', '2017-01-10')
.then(console.log)


```
    
