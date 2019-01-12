"use strict";

// this file is here for two reasons:
// 1. web requires ./GPUSettings file from electron app (bad!), and requires are
//    relative to process.main (bootstrap's index.js)
// 2. GPUSettings has been refactored into GPUSettings, and because we want to
//    be able to update GPUSettings OTA, we will have the core module provide
//    us with the GPUSettings
// so tl;dr this is core module's GPUSettings, providing compat for web

exports.replace = function (GPUSettings) {
  // replacing module.exports directly would have no effect, since requires are cached
  // so we mutate the existing object
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = Object.keys(GPUSettings)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var name = _step.value;

      exports[name] = GPUSettings[name];
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
};