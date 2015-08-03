'use strict';

var extend = require('util')._extend;

module.exports = query;

var caches = {};
var defaults = {
  debug: false,
  useCache: true,
  expires: '+1 minute'
};

function query(query, opts, callback) {
  if (!callback) {
    callback = opts;
    opts = defaults;
  } else {
    opts = extend(defaults, opts);
  }
  if (opts.debug) {
    console.log('Config:', opts);
  }

  var cache = getCache(query, opts);

  var hasCachedQuery = getCached(cache, opts);
  if (hasCachedQuery) {
    // use cached data, callback and return
    callback.apply(this, cache.results);
    return cache;
  }

  // add callback to the list
  cache.callbacks.push(callback);

  // if there's only 1 callback (this if the first time the query is being run)
  // or if useCache is false, query the db.
  if (cache.callbacks.length === 1 || !opts.useCache) {
    // only run if it's the first time this query is being called.
    if (opts.debug) {
      console.log('Run query...');
    }
    query(function() {
      // console.warn(arguments);
      if (opts.debug) {
        console.log('Got results');
      }
      // save the query results
      cache.results = arguments;

      // call back all the callbacks
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
      cache.results = undefined;
    } else {
      if (opts.debug) {
        console.log('Replying from cache');
      }
      return cache;
    }
  }
  return false;
}

function getCache(query, opts) {
  var cacheId = query.toString();
  if (opts.debug) {
    // console.log(cacheId);
  }
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
