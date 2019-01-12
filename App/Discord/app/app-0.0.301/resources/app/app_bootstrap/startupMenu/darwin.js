'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _electron = require('electron');

exports.default = [{
  label: 'Discord',
  submenu: [{
    label: 'Quit',
    click: function click() {
      return _electron.app.quit();
    },
    accelerator: 'Command+Q'
  }]
}];
module.exports = exports['default'];