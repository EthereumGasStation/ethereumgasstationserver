#!/usr/bin/env node
'use strict';

const GasstationServer = require('./src/lib/gasstationserver-cli.js');
const cli = new GasstationServer();
cli.go();
