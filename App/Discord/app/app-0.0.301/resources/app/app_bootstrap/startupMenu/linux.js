'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _electron = require('electron');

exports.default = [{
  label: '&File',
  submenu: [{
    label: '&Exit',
    click: function click() {
      return _electron.app.quit();
    },
    accelerator: 'Control+Q'
  }]
}];
module.exports = exports['default'];