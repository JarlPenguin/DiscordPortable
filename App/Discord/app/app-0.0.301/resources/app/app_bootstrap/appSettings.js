'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.init = init;
exports.getSettings = getSettings;

var _Settings = require('../common/Settings');

var _Settings2 = _interopRequireDefault(_Settings);

var _paths = require('../common/paths');

var paths = _interopRequireWildcard(_paths);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var settings = void 0;

function init() {
  settings = new _Settings2.default(paths.getUserData());
}

function getSettings() {
  return settings;
}