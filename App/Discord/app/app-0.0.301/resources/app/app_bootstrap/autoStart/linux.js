'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.install = install;
exports.update = update;
exports.isInstalled = isInstalled;
exports.uninstall = uninstall;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _electron = require('electron');

var _buildInfo = require('../buildInfo');

var _buildInfo2 = _interopRequireDefault(_buildInfo);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// TODO: We should use Constant's APP_NAME, but only once
//       we set up backwards compat with this.
var appName = _path2.default.basename(process.execPath, '.exe');
var exePath = _electron.app.getPath('exe');
var exeDir = _path2.default.dirname(exePath);
var iconPath = _path2.default.join(exeDir, 'discord.png');
var autostartDir = _path2.default.join(_electron.app.getPath('appData'), 'autostart');
var autostartFileName = _path2.default.join(autostartDir, _electron.app.getName() + '-' + _buildInfo2.default.releaseChannel + '.desktop');
var desktopFileBase = '[Desktop Entry]\nType=Application\nExec=' + exePath + '\nHidden=false\nNoDisplay=false\nName=' + appName + '\nIcon=' + iconPath + '\nComment=Text and voice chat for gamers.\n';

function ensureDir() {
  try {
    _fs2.default.mkdirSync(autostartDir);
    return true;
  } catch (e) {
    // catch for when it already exists.
  }
  return false;
}

function writeStartupFile(enabled, callback) {
  // TODO: This could fail. We should read its return value
  ensureDir();
  var desktopFile = desktopFileBase + ('X-GNOME-Autostart-enabled=' + enabled + '\n');
  try {
    _fs2.default.writeFile(autostartFileName, desktopFile, callback);
  } catch (e) {
    // I guess we don't autostart then
    callback();
  }
}

function install(callback) {
  return writeStartupFile(true, callback);
}

function update(callback) {
  // TODO: We might need to implement this later on
  return callback();
}

function isInstalled(callback) {
  try {
    _fs2.default.readFile(autostartFileName, 'utf8', function (err, data) {
      if (err) {
        return callback(false);
      }
      var res = /X-GNOME-Autostart-enabled=true/.test(data);
      return callback(res);
    });
  } catch (e) {
    return callback(false);
  }
}

function uninstall(callback) {
  return writeStartupFile(false, callback);
}