'use strict';

global.__SDK__ = false;

var buildInfo = require('./buildInfo');
var paths = require('../common/paths');
paths.init(buildInfo);
var moduleUpdater = require('../common/moduleUpdater');
moduleUpdater.initPathsOnly(buildInfo);
var requireNative = require('./requireNative');

function getAppMode() {
  if (process.argv && process.argv.includes('--overlay-host')) {
    return 'overlay-host';
  }

  return 'app';
}

var mode = getAppMode();
if (mode === 'app') {
  require('./bootstrap');
} else if (mode === 'overlay-host') {
  requireNative('discord_overlay2/standalone_host.js');
}