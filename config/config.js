"use strict";

// requires
const _ = require("lodash");

// module variables
const config = require("./config.json");
const defaultConfig = config.testing;
const environment = process.env.NODE_ENV || "testing";
const environmentConfig = config[environment];
const finalConfig = _.merge(defaultConfig, environmentConfig);

// global configuration
global.gConfig = finalConfig;

// log global.gConfig
console.log(`global.gConfig: ${JSON.stringify(global.gConfig)}`);
