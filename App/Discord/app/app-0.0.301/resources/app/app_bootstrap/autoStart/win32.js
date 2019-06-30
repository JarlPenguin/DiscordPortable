'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.install = install;
exports.update = update;
exports.isInstalled = isInstalled;
exports.uninstall = uninstall;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _windowsUtils = require('../windowsUtils');

var windowsUtils = _interopRequireWildcard(_windowsUtils);

var _appSettings = require('../appSettings');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var settings = (0, _appSettings.getSettings)();

// TODO: We should use Constant's APP_NAME, but only once
//       we set up backwards compat with this.
var appName = _path2.default.basename(process.execPath, '.exe');

function install(callback) {
  var startMinimized = settings.get('START_MINIMIZED', false);
  var _process = process,
      execPath = _process.execPath;

  if (startMinimized) {
    execPath = execPath + ' --start-minimized';
  }
  var queue = [['HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run', '/v', appName, '/d', execPath]];

  windowsUtils.addToRegistry(queue, callback);
}

function update(callback) {
  isInstalled(function (installed) {
    if (installed) {
      install(callback);
    } else {
      callback();
    }
  });
}

function isInstalled(callback) {
  var queryValue = ['HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run', '/v', appName];
  queryValue.unshift('query');
  windowsUtils.spawnReg(queryValue, function (error, stdout) {
    var doesOldKeyExist = stdout.indexOf(appName) >= 0;
    callback(doesOldKeyExist);
  });
}

function uninstall(callback) {
  var queryValue = ['HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run', '/v', appName, '/f'];
  queryValue.unshift('delete');
  windowsUtils.spawnReg(queryValue, function (error, stdout) {
    callback();
  });
}