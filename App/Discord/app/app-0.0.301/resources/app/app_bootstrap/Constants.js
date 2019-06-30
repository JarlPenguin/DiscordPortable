'use strict';

// bootstrap constants
// after startup, these constants will be merged into core module constants
// since they are used in both locations (see app/Constants.js)

var _require = require('./buildInfo'),
    releaseChannel = _require.releaseChannel;

var _require2 = require('./appSettings'),
    getSettings = _require2.getSettings;

var settings = getSettings();

function capitalizeFirstLetter(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

var APP_NAME = 'Discord' + (releaseChannel === 'stable' ? '' : capitalizeFirstLetter(releaseChannel));
var APP_ID_BASE = 'com.squirrel';
var APP_ID = APP_ID_BASE + '.' + APP_NAME + '.' + APP_NAME;

var API_ENDPOINT = settings.get('API_ENDPOINT') || 'https://discordapp.com/api';
var UPDATE_ENDPOINT = settings.get('UPDATE_ENDPOINT') || API_ENDPOINT;

module.exports = {
  APP_NAME: APP_NAME,
  APP_ID: APP_ID,
  API_ENDPOINT: API_ENDPOINT,
  UPDATE_ENDPOINT: UPDATE_ENDPOINT
};