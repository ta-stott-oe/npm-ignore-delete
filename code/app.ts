#!/usr/bin/env node

import yargs = require('yargs');
import Q = require('q')
import nio = require('./delete-operation')
import {CopyOperation} from "./copy-operation";
import {Verbosity} from "./ignorer";

var argv = yargs
    .command('delete', 'Delete files and subdirectories from a directory using the .npmignore file therein',
        _yargs => {
            const _argv = _yargs
                .demand(1)
                .option('n', {
                    alias: 'node-modules',
                    default: false,
                    required: false
                
                })
                .argv;
        
            DoDelete(_argv._[1], _argv.n);
        }
    )
    .command('copy', 'Copy files and subdirectories from one directory to another, excluding items based on the .npmignore file therein',
        _yargs => {
            const _argv = _yargs
                .demand(2)
                .argv;
        
            DoCopy(_argv._[1], _argv._[2]);
        }
    )
    .argv;


Q.longStackSupport = true;

function DoDelete(directory: string, allowIgnoreNodeModules: boolean){
    var op = new nio.DeleteOperation(directory, Verbosity.Normal, false, argv.n);
    op.Execute()
        .done(stats => {
            console.log(`We're done here\n\n`);
            console.log(stats);
        });
}

function DoCopy(source: string, destination: string){
    var op = new CopyOperation(source, destination);
    op.Execute()
        .done(stats => {
            console.log(`We're done here\n\n`);
            console.log(stats);
        });
}


