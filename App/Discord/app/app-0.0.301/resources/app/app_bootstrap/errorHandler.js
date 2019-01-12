'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.init = init;
exports.fatal = fatal;

var _electron = require('electron');

function isErrorSafeToSuppress(error) {
  return (/attempting to call a function in a renderer window/i.test(error.message)
  );
}

function init() {
  process.on('uncaughtException', function (error) {
    var stack = error.stack ? error.stack : String(error);
    var message = 'Uncaught exception:\n ' + stack;
    console.warn(message);

    if (!isErrorSafeToSuppress(error)) {
      _electron.dialog.showErrorBox('A JavaScript error occurred in the main process', message);
    }
  });
}

// show a similar error message to the error handler, except exit out the app
// after the error message has been closed
function fatal(err) {
  _electron.dialog.showMessageBox({
    type: 'error',
    message: 'A fatal Javascript error occured',
    detail: err && err.stack ? err.stack : String(err)
  }, function () {
    _electron.app.quit();
  });
}