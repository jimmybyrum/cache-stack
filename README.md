### cache-stack
Utility that caches functions (until they expire) and stacks callbacks (for longer running functions).

```
npm install cache-stack
```

#### Usage

```js
var cacheStack = require('cache-stack');

cacheStack(
  function(onResult) {
    // db call, or some other longer running function
    Transaction.find({
      user: <MongoId>
    }).lean().exec(onResult);
  },
  { // everything, including this object, is optional
    expires: '+10 seconds', // default is +1 minute (milliseconds, seconds, minutes, hours, days, months, years)
    debug: true, // default is false
    useCache: false // default is true
  },
  // the last param will always be the clearCache function
  function(errors, results, clearCache) {
    // do something with the results
    ...
  }
);
```
