#!/usr/bin/env node

import yargs = require('yargs');
import Q = require('q')
import nio = require('./npm-ignore-operation')

var argv = yargs
    .demand(1)
    .option('n', {
        alias: 'node-modules',
        default: false,
        required: false
    })
    .argv;


Q.longStackSupport = true;

var op = new nio.NpmIgnoreOperation(argv._[0], nio.Verbosity.Normal, false, argv.n);
op.Execute()
	.done(stats => {
		console.log(`We're done here\n\n`);
		console.log(stats);
	});
