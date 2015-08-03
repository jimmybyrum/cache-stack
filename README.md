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
    expires: '+1 hour', // default is +1 minute
                        // milliseconds, seconds, minutes, hours, days, months, years
    debug: true, // outputs some console logs so that you can see what's happening.
                 // default is false
    useCache: true // set to false if you want a new execution of the function.
                   // default is true
  },
  // the last param will always be the clearCache function
  function(errors, results, clearCache) {
    // do something with the results
    ...
  }
);
```
