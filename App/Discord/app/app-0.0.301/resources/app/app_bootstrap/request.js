'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _electron = require('electron');

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _log(_msg) {
  // console.log('[Request] ' + _msg);
}

function requestWithMethod(method, origOpts, origCallback) {
  var _this = this;

  if (typeof origOpts == 'string') {
    origOpts = { url: origOpts };
  }

  var opts = _extends({}, origOpts, { method: method });

  var callback = void 0;
  if (origCallback || opts.callback) {
    var origOptsCallback = opts.callback;
    delete opts.callback;
    callback = function callback() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      if (origCallback) {
        origCallback.apply(_this, args);
      }
      if (origOptsCallback) {
        origOptsCallback.apply(_this, args);
      }
    };
  }

  var strictOpts = _extends({}, opts, { strictSSL: true });
  var laxOpts = _extends({}, opts, { strictSSL: false });

  var rv = new _events2.default();

  if (callback) {
    _log('have callback, so wrapping');
    rv.on('response', function (response) {
      var chunks = [];
      response.on('data', function (chunk) {
        return chunks.push(chunk);
      });
      response.on('end', function () {
        callback(null, response, Buffer.concat(chunks));
      });
    });
    rv.on('error', function (error) {
      return callback(error);
    });
  }

  var requestTypes = [{
    factory: function factory() {
      return (0, _request2.default)(strictOpts);
    },
    method: 'node_request_strict'
  }, {
    factory: function factory() {
      var nr = _electron.net.request(strictOpts);
      nr.end();
      return nr;
    },
    method: 'electron_net_request_strict'
  }, {
    factory: function factory() {
      return (0, _request2.default)(laxOpts);
    },
    method: 'node_request_lax'
  }];

  function attempt(index) {
    var _requestTypes$index = requestTypes[index],
        factory = _requestTypes$index.factory,
        method = _requestTypes$index.method;

    _log('Attempt #' + (index + 1) + ': ' + method);
    factory().on('response', function (response) {
      _log(method + ' success! emitting response ' + response);
      rv.emit('response', response);
    }).on('error', function (error) {
      if (index + 1 < requestTypes.length) {
        _log(method + ' failure, trying next option');
        attempt(index + 1);
      } else {
        _log(method + ' failure, out of options');
        rv.emit('error', error);
      }
    });
  }

  attempt(0);

  return rv;
}

// only supports get for now, since retrying is non-idempotent and
// we'd want to grovel the errors to make sure it's safe to retry
var _arr = ['get'];
for (var _i = 0; _i < _arr.length; _i++) {
  var method = _arr[_i];
  requestWithMethod[method] = requestWithMethod.bind(null, method);
}

exports.default = requestWithMethod;
module.exports = exports['default'];