'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
// used in devtools to hook in additional dev tools
// require('electron').remote.require('./installDevTools')()

function installDevTools() {
  console.log('Installing Devtron');
  var devtron = require('devtron');
  devtron.uninstall();
  devtron.install();
  console.log('Installed Devtron');
}

exports.default = installDevTools;
module.exports = exports['default'];