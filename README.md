### cache-stack
Utility that caches functions (until they expire) and stacks callbacks (for longer running functions).

```
npm install cache-stack
```

#### Usage

```js
var cacheStack = require('cache-stack');

var cs = cacheStack(
  // db call, or some other longer running operation
  function(onResult) {
    Transaction.find({
      user: <MongoId>
    }).lean().exec(onResult);
  },

  { // everything, including this object, is optional
    key: 'unique-id-1234', // by default, cacheStack will try to create a key
                           // for the data based on the first argument.
                           // if you don't expect that to be unique, then pass
                           // a unique key here.
    expires: '+1 hour', // default is +1 minute
                        // milliseconds, seconds, minutes, hours, days, months, years
    debug: true, // outputs some console logs so that you can see what's happening.
                 // default is false
    useCache: true // set to false if you want a new execution of the function.
                   // default is true
  },

  function() {
    // do something when the function returns data
  }
);

// cs.clear(); to clear the cache immediately.
```
