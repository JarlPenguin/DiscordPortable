'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.update = update;
exports.focusSplash = focusSplash;

var _moduleUpdater = require('../common/moduleUpdater');

var moduleUpdater = _interopRequireWildcard(_moduleUpdater);

var _splashScreen = require('./splashScreen');

var splashScreen = _interopRequireWildcard(_splashScreen);

var _appSettings = require('./appSettings');

var _Constants = require('./Constants');

var _buildInfo = require('./buildInfo');

var _buildInfo2 = _interopRequireDefault(_buildInfo);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function update(startMinimized, doneCallback, showCallback) {
  var settings = (0, _appSettings.getSettings)();
  moduleUpdater.init(_Constants.UPDATE_ENDPOINT, settings, _buildInfo2.default);

  splashScreen.initSplash(startMinimized);
  splashScreen.events.once(splashScreen.APP_SHOULD_LAUNCH, doneCallback);
  splashScreen.events.once(splashScreen.APP_SHOULD_SHOW, showCallback);
}

function focusSplash() {
  splashScreen.focusWindow();
}