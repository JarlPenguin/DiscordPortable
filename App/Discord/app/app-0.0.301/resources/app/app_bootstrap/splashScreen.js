'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.events = exports.APP_SHOULD_SHOW = exports.APP_SHOULD_LAUNCH = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.initSplash = initSplash;
exports.focusWindow = focusWindow;
exports.pageReady = pageReady;

var _electron = require('electron');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _events = require('events');

var _moduleUpdater = require('../common/moduleUpdater');

var moduleUpdater = _interopRequireWildcard(_moduleUpdater);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var UPDATE_TIMEOUT_WAIT = 10000;
var RETRY_CAP_SECONDS = 60;
// citron note: atom seems to add about 50px height to the frame on mac but not windows
// TODO: see if we can eliminate fudge by using useContentSize BrowserWindow option
var LOADING_WINDOW_WIDTH = 300;
var LOADING_WINDOW_HEIGHT = process.platform == 'darwin' ? 300 : 350;

// TODO: addModulesListener events should use Module's constants
var CHECKING_FOR_UPDATES = 'checking-for-updates';
var UPDATE_CHECK_FINISHED = 'update-check-finished';
var UPDATE_FAILURE = 'update-failure';
var LAUNCHING = 'launching';
var DOWNLOADING_MODULE = 'downloading-module';
var DOWNLOADING_UPDATES = 'downloading-updates';
var DOWNLOADING_MODULES_FINISHED = 'downloading-modules-finished';
var DOWNLOADING_MODULE_PROGRESS = 'downloading-module-progress';
var DOWNLOADED_MODULE = 'downloaded-module';
var NO_PENDING_UPDATES = 'no-pending-updates';
var INSTALLING_MODULE = 'installing-module';
var INSTALLING_UPDATES = 'installing-updates';
var INSTALLED_MODULE = 'installed-module';
var INSTALLING_MODULE_PROGRESS = 'installing-module-progress';
var INSTALLING_MODULES_FINISHED = 'installing-modules-finished';
var UPDATE_MANUALLY = 'update-manually';

var APP_SHOULD_LAUNCH = exports.APP_SHOULD_LAUNCH = 'APP_SHOULD_LAUNCH';
var APP_SHOULD_SHOW = exports.APP_SHOULD_SHOW = 'APP_SHOULD_SHOW';

var events = exports.events = new _events.EventEmitter();

var splashWindow = void 0;
var modulesListeners = void 0;
var updateTimeout = void 0;
var updateAttempt = void 0;
var splashState = void 0;
var launchedMainWindow = void 0;

function initSplash() {
  var startMinimized = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

  modulesListeners = {};
  splashState = {};
  launchedMainWindow = false;
  updateAttempt = 0;

  addModulesListener(CHECKING_FOR_UPDATES, function () {
    startUpdateTimeout();
    updateSplashState(CHECKING_FOR_UPDATES);
  });

  addModulesListener(UPDATE_CHECK_FINISHED, function (succeeded, updateCount, manualRequired) {
    stopUpdateTimeout();
    if (!succeeded) {
      scheduleUpdateCheck();
      updateSplashState(UPDATE_FAILURE);
    } else if (updateCount === 0) {
      launchMainWindow();
      updateSplashState(LAUNCHING);
    }
  });

  addModulesListener(DOWNLOADING_MODULE, function (name, current, total) {
    stopUpdateTimeout();
    splashState = { current: current, total: total };
    updateSplashState(DOWNLOADING_UPDATES);
  });

  addModulesListener(DOWNLOADING_MODULE_PROGRESS, function (name, progress) {
    splashState.progress = progress;
    updateSplashState(DOWNLOADING_UPDATES);
  });

  addModulesListener(DOWNLOADED_MODULE, function (name, current, total, succeeded) {
    return delete splashState.progress;
  });

  addModulesListener(DOWNLOADING_MODULES_FINISHED, function (succeeded, failed) {
    if (failed > 0) {
      scheduleUpdateCheck();
      updateSplashState(UPDATE_FAILURE);
    } else {
      process.nextTick(function () {
        return moduleUpdater.quitAndInstallUpdates();
      });
    }
  });

  addModulesListener(NO_PENDING_UPDATES, function () {
    return moduleUpdater.checkForUpdates();
  });

  addModulesListener(INSTALLING_MODULE, function (name, current, total) {
    splashState = { current: current, total: total };
    updateSplashState(INSTALLING_UPDATES);
  });

  addModulesListener(INSTALLED_MODULE, function (name, current, total, succeeded) {
    return delete splashState.progress;
  });

  addModulesListener(INSTALLING_MODULE_PROGRESS, function (name, progress) {
    splashState.progress = progress;
    updateSplashState(INSTALLING_UPDATES);
  });

  addModulesListener(INSTALLING_MODULES_FINISHED, function (succeeded, failed) {
    return moduleUpdater.checkForUpdates();
  });

  addModulesListener(UPDATE_MANUALLY, function (newVersion) {
    splashState.newVersion = newVersion;
    updateSplashState(UPDATE_MANUALLY);
  });

  launchSplashWindow(startMinimized);
}

function destroySplash() {
  removeModulesListeners();
  stopUpdateTimeout();

  if (splashWindow) {
    splashWindow.setSkipTaskbar(true);
    // defer the window hiding for a short moment so it gets covered by the main window
    var _nukeWindow = function _nukeWindow() {
      splashWindow.hide();
      splashWindow.close();
      splashWindow = null;
    };
    setTimeout(_nukeWindow, 100);
  }
}

function addModulesListener(event, listener) {
  modulesListeners[event] = listener;
  moduleUpdater.events.addListener(event, listener);
}

function removeModulesListeners() {
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = Object.keys(modulesListeners)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var event = _step.value;

      moduleUpdater.events.removeListener(event, modulesListeners[event]);
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
}

function startUpdateTimeout() {
  if (!updateTimeout) {
    updateTimeout = setTimeout(function () {
      return scheduleUpdateCheck();
    }, UPDATE_TIMEOUT_WAIT);
  }
}

function stopUpdateTimeout() {
  if (updateTimeout) {
    clearTimeout(updateTimeout);
    updateTimeout = null;
  }
}

function updateSplashState(event) {
  if (splashWindow != null && !splashWindow.isDestroyed() && !splashWindow.webContents.isDestroyed()) {
    splashWindow.webContents.send('UPDATE_STATE', _extends({ status: event }, splashState));
  }
}

function launchSplashWindow(startMinimized) {
  var windowConfig = {
    width: LOADING_WINDOW_WIDTH,
    height: LOADING_WINDOW_HEIGHT,
    transparent: false,
    frame: false,
    resizable: false,
    center: true,
    show: false
  };

  splashWindow = new _electron.BrowserWindow(windowConfig);

  // prevent users from dropping links to navigate in splash window
  splashWindow.webContents.on('will-navigate', function (e) {
    return e.preventDefault();
  });

  splashWindow.webContents.on('new-window', function (e, windowURL) {
    e.preventDefault();
    _electron.shell.openExternal(windowURL);
    // exit, but delay half a second because openExternal is about to fire
    // some events to things that are freed by app.quit.
    setTimeout(_electron.app.quit, 500);
  });

  if (process.platform !== 'darwin') {
    // citron note: this causes a crash on quit while the window is open on osx
    splashWindow.on('closed', function () {
      splashWindow = null;
      if (!launchedMainWindow) {
        // user has closed this window before we launched the app, so let's quit
        _electron.app.quit();
      }
    });
  }

  _electron.ipcMain.on('SPLASH_SCREEN_READY', function () {
    if (splashWindow && !startMinimized) {
      splashWindow.show();
    }

    moduleUpdater.installPendingUpdates();
  });

  var splashUrl = _url2.default.format({
    protocol: 'file',
    slashes: true,
    pathname: _path2.default.join(__dirname, 'splash', 'index.html')
  });

  splashWindow.loadURL(splashUrl);
}

function launchMainWindow() {
  if (!launchedMainWindow && splashWindow != null) {
    launchedMainWindow = true;
    events.emit(APP_SHOULD_LAUNCH);
  }
}

function scheduleUpdateCheck() {
  // TODO: can we use backoff here?
  updateAttempt += 1;
  var retryInSeconds = Math.min(updateAttempt * 10, RETRY_CAP_SECONDS);
  splashState.seconds = retryInSeconds;
  setTimeout(function () {
    return moduleUpdater.checkForUpdates();
  }, retryInSeconds * 1000);
}

function focusWindow() {
  if (splashWindow != null) {
    splashWindow.focus();
  }
}

function pageReady() {
  destroySplash();
  process.nextTick(function () {
    return events.emit(APP_SHOULD_SHOW);
  });
}