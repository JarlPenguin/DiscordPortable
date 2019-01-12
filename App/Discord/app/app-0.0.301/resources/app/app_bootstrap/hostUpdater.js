'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _events = require('events');

var _squirrelUpdate = require('./squirrelUpdate');

var squirrelUpdate = _interopRequireWildcard(_squirrelUpdate);

var _electron = require('electron');

var _request = require('./request');

var _request2 = _interopRequireDefault(_request);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function versionParse(verString) {
  return verString.split('.').map(function (i) {
    return parseInt(i);
  });
}

function versionNewer(verA, verB) {
  var i = 0;
  while (true) {
    var a = verA[i];
    var b = verB[i];
    i++;
    if (a === undefined) {
      return false;
    } else {
      if (b === undefined || a > b) {
        return true;
      }
      if (a < b) {
        return false;
      }
    }
  }
}

var AutoUpdaterWin32 = function (_EventEmitter) {
  _inherits(AutoUpdaterWin32, _EventEmitter);

  function AutoUpdaterWin32() {
    _classCallCheck(this, AutoUpdaterWin32);

    var _this = _possibleConstructorReturn(this, (AutoUpdaterWin32.__proto__ || Object.getPrototypeOf(AutoUpdaterWin32)).call(this));

    _this.updateUrl = null;
    _this.updateVersion = null;
    return _this;
  }

  _createClass(AutoUpdaterWin32, [{
    key: 'setFeedURL',
    value: function setFeedURL(updateUrl) {
      this.updateUrl = updateUrl;
    }
  }, {
    key: 'quitAndInstall',
    value: function quitAndInstall() {
      if (squirrelUpdate.updateExistsSync()) {
        squirrelUpdate.restart(_electron.app, this.updateVersion || _electron.app.getVersion());
      } else {
        require('auto-updater').quitAndInstall();
      }
    }
  }, {
    key: 'downloadAndInstallUpdate',
    value: function downloadAndInstallUpdate(callback) {
      var _this2 = this;

      squirrelUpdate.spawnUpdateInstall(this.updateUrl, function (progress) {
        _this2.emit('update-progress', progress);
      }).catch(function (err) {
        return callback(err);
      }).then(function () {
        return callback();
      });
    }
  }, {
    key: 'checkForUpdates',
    value: function checkForUpdates() {
      var _this3 = this;

      if (this.updateUrl == null) {
        throw new Error('Update URL is not set');
      }

      this.emit('checking-for-update');

      if (!squirrelUpdate.updateExistsSync()) {
        this.emit('update-not-available');
        return;
      }

      squirrelUpdate.spawnUpdate(['--check', this.updateUrl], function (error, stdout) {
        if (error != null) {
          _this3.emit('error', error);
          return;
        }

        try {
          // Last line of the output is JSON details about the releases
          var json = stdout.trim().split('\n').pop();
          var releasesFound = JSON.parse(json).releasesToApply;
          if (releasesFound == null || releasesFound.length == 0) {
            _this3.emit('update-not-available');
            return;
          }

          var update = releasesFound.pop();
          _this3.emit('update-available');
          _this3.downloadAndInstallUpdate(function (error) {
            if (error != null) {
              _this3.emit('error', error);
              return;
            }

            _this3.updateVersion = update.version;

            _this3.emit('update-downloaded', {}, update.release, update.version, new Date(), _this3.updateUrl, _this3.quitAndInstall.bind(_this3));
          });
        } catch (error) {
          error.stdout = stdout;
          _this3.emit('error', error);
        }
      });
    }
  }]);

  return AutoUpdaterWin32;
}(_events.EventEmitter);

// todo


var AutoUpdaterLinux = function (_EventEmitter2) {
  _inherits(AutoUpdaterLinux, _EventEmitter2);

  function AutoUpdaterLinux() {
    _classCallCheck(this, AutoUpdaterLinux);

    var _this4 = _possibleConstructorReturn(this, (AutoUpdaterLinux.__proto__ || Object.getPrototypeOf(AutoUpdaterLinux)).call(this));

    _this4.updateUrl = null;
    return _this4;
  }

  _createClass(AutoUpdaterLinux, [{
    key: 'setFeedURL',
    value: function setFeedURL(url) {
      this.updateUrl = url;
    }
  }, {
    key: 'checkForUpdates',
    value: function checkForUpdates() {
      var _this5 = this;

      var currVersion = versionParse(_electron.app.getVersion());
      this.emit('checking-for-update');

      _request2.default.get({ url: this.updateUrl, encoding: null }, function (error, response, body) {
        if (error) {
          console.error('[Updates] Error fetching ' + _this5.updateUrl + ': ' + error);
          _this5.emit('error', error);
          return;
        }

        if (response.statusCode === 204) {
          // you are up to date
          _this5.emit('update-not-available');
        } else if (response.statusCode === 200) {
          var latestVerStr = '';
          var latestVersion = [];
          try {
            var latestMetadata = JSON.parse(body);
            latestVerStr = latestMetadata.name;
            latestVersion = versionParse(latestVerStr);
          } catch (e) {}

          if (versionNewer(latestVersion, currVersion)) {
            console.log('[Updates] You are out of date!');
            // you need to update
            _this5.emit('update-manually', latestVerStr);
          } else {
            console.log('[Updates] You are living in the future!');
            _this5.emit('update-not-available');
          }
        } else {
          // something is wrong
          console.error('[Updates] Error: fetch returned: ' + response.statusCode);
          _this5.emit('update-not-available');
        }
      });
    }
  }]);

  return AutoUpdaterLinux;
}(_events.EventEmitter);

var autoUpdater = void 0;

// TODO
// events: checking-for-update, update-available, update-not-available, update-manually, update-downloaded, error
// also, checkForUpdates, setFeedURL, quitAndInstall
// also, see electron.autoUpdater, and its API
switch (process.platform) {
  case 'darwin':
    autoUpdater = require('electron').autoUpdater;
    break;
  case 'win32':
    autoUpdater = new AutoUpdaterWin32();
    break;
  case 'linux':
    autoUpdater = new AutoUpdaterLinux();
    break;
}

exports.default = autoUpdater;
module.exports = exports['default'];