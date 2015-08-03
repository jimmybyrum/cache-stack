'use strict';

var slugify = require('slugify');

var extend = require('util')._extend;

module.exports = cacheBack;

var caches = {};
var defaults = {
  debug: false,
  useCache: true,
  expires: '+1 minute'
};

function cacheBack(fn, opts, callback) {
  if (!callback) {
    callback = opts;
    opts = defaults;
  } else {
    opts = extend(defaults, opts);
  }

  var cache = getCache(fn, opts);

  var hasCached = getCached(cache, opts);
  if (hasCached) {
    // use cached data, callback and return
    if (opts.debug) {
      console.log('Calling back with cached data');
    }
    callback.apply(this, cache.results);
    return cache;
  }

  // add callback to the list
  cache.callbacks.push(callback);

  // if there's only 1 callback (this if the first time the function is being run)
  // or if useCache is false, run the function
  if (cache.callbacks.length === 1 || !opts.useCache) {
    if (opts.debug) {
      console.log('Run function with config: ', opts);
    }
    fn(function() {
      // save the fn results
      cache.results = arguments;

      // call back all the callbacks
      if (opts.debug) {
        if (cache.callbacks.length) {
          console.log('Calling ' + cache.callbacks.length + ' callbacks');
        }
      }
      while(cache.callbacks.length > 0) {
        var cb = cache.callbacks.shift();
        cb.apply(this, cache.results);
      }
    }, cache);
  }

  return cache;
}

function getCached(cache, opts) {
  if (cache.results && opts.useCache) {
    var now = new Date();
    if (cache.expires < now) {
      if (opts.debug) {
        console.log('Removing expired results');
      }
      cache.expires = getExpires(opts.expires);
      cache.results = undefined;
    } else {
      return cache;
    }
  }
  return false;
}

function getCache(fn, opts) {
  var cacheId = slugify(opts.key || fn.toString());
  // console.warn(cacheId);
  var cache = caches[cacheId];
  if (!cache) {
    caches[cacheId] = {
      callbacks: [],
      expires: getExpires(opts.expires),
      clear: function() {
        caches[cacheId] = undefined;
      }
    };
    cache = caches[cacheId];
  }
  return cache;
}

function getExpires(expiresString) {
  // looking for something like: "+5 days"
  if (expiresString.match(/^(\+|\-)\d+\s\w+/)) {
    var expires = new Date();
    var operator = expiresString.substring(0, 1);
    var parts = expiresString.substring(1).split(' ');
    var num = parseInt(parts[0], 10);
    var time = parts[1];
    switch(time) {
      case 'millisecond':
      case 'milliseconds':
        time = 'Milliseconds';
      break;
      case 'second':
      case 'seconds':
        time = 'Seconds';
      break;
      case 'minute':
      case 'minutes':
        time = 'Minutes';
      break;
      case 'hour':
      case 'hours':
        time = 'Hours';
      break;
      case 'day':
      case 'days':
        time = 'Date';
      break;
      case 'month':
      case 'months':
        time = 'Month';
      break;
      case 'year':
      case 'years':
        time = 'FullYear';
      break;
    }
    if (operator === '-') {
      expires['set' + time](expires['get' + time]() - num);
    } else {
      expires['set' + time](expires['get' + time]() + num);
    }
    return expires;
  }
  return new Date();
}
