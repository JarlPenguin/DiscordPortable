'use strict';

// bootstrap, or what runs before the rest of desktop does
// responsible for handling updates and updating modules before continuing startup

if (process.platform === 'linux') {
  // Some people are reporting audio problems on Linux that are fixed by setting
  // an environment variable PULSE_LATENCY_MSEC=30 -- the "real" fix is to see
  // what conditions require this and set this then (also to set it directly in
  // our webrtc setup code rather than here) but this should fix the bug for now.
  if (process.env.PULSE_LATENCY_MSEC === undefined) {
    process.env.PULSE_LATENCY_MSEC = 30;
  }
}

var _require = require('electron'),
    app = _require.app,
    Menu = _require.Menu;

var buildInfo = require('./buildInfo');
app.setVersion(buildInfo.version);

// expose releaseChannel to a global, since it's used by splash screen
global.releaseChannel = buildInfo.releaseChannel;

var errorHandler = require('./errorHandler');
errorHandler.init();

var paths = require('../common/paths');
paths.init(buildInfo);

global.modulePath = paths.getModulePath();

var appSettings = require('./appSettings');
appSettings.init();

var Constants = require('./Constants');
var GPUSettings = require('./GPUSettings');

var settings = appSettings.getSettings();
// TODO: this is a copy of gpuSettings.getEnableHardwareAcceleration
if (!settings.get('enableHardwareAcceleration', true)) {
  app.disableHardwareAcceleration();
}

function hasArgvFlag(flag) {
  return (process.argv || []).slice(1).includes(flag);
}

console.log(Constants.APP_NAME + ' ' + app.getVersion());

var preventStartup = false;
if (process.platform === 'win32') {
  // this tells Windows (in particular Windows 10) which icon to associate your app with, important for correctly
  // pinning app to task bar.
  app.setAppUserModelId(Constants.APP_ID);

  var _require2 = require('./squirrelUpdate'),
      handleStartupEvent = _require2.handleStartupEvent;
  // TODO: Isn't using argv[1] fragile?


  var squirrelCommand = process.argv[1];
  // TODO: Should `Discord` be a constant in this case? It's a protocol.
  // TODO: Is protocol case sensitive?
  if (handleStartupEvent('Discord', app, squirrelCommand)) {
    preventStartup = true;
  }
}

var singleInstance = require('./singleInstance');
var appUpdater = require('./appUpdater');
var moduleUpdater = require('../common/moduleUpdater');
var splashScreen = require('./splashScreen');
var autoStart = require('./autoStart');
var requireNative = require('./requireNative');
var coreModule = void 0;

function startUpdate() {
  var startMinimized = hasArgvFlag('--start-minimized');

  appUpdater.update(startMinimized, function () {
    try {
      coreModule = requireNative('discord_desktop_core');
      coreModule.startup({
        paths: paths,
        splashScreen: splashScreen,
        moduleUpdater: moduleUpdater,
        autoStart: autoStart,
        buildInfo: buildInfo,
        appSettings: appSettings,
        Constants: Constants,
        GPUSettings: GPUSettings
      });
    } catch (err) {
      return errorHandler.fatal(err);
    }
  }, function () {
    coreModule.setMainWindowVisible(!startMinimized);
  });
}

function startApp() {
  paths.cleanOldVersions(buildInfo);
  var startupMenu = require('./startupMenu');
  Menu.setApplicationMenu(startupMenu);

  var multiInstance = true;

  if (multiInstance) {
    startUpdate();
  } else {
    singleInstance.create(startUpdate, function (args) {
      // TODO: isn't relying on index 0 awfully fragile?
      if (args != null && args.length > 0 && args[0] === '--squirrel-uninstall') {
        app.quit();
        return;
      }

      if (coreModule) {
        coreModule.handleSingleInstance(args);
      } else {
        appUpdater.focusSplash();
      }
    });
  }
}

if (preventStartup) {
  console.log('Startup prevented.');
  // TODO: shouldn't we exit out?
} else {
  console.log('Starting updater.');
  if (app.isReady()) {
    startApp();
  } else {
    app.once('ready', startApp);
  }
}