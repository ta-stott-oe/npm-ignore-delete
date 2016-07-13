import {Ignorer, IgnoreOptions, Verbosity} from "../ignorer"
import fs = require('fs')
import Q = require('q')

export interface IgnoreParser {
    Parse(ignoreFileContents: string, options?: IgnoreOptions): Ignorer
}

export abstract class LinedIgnoreParser implements IgnoreParser {

    Parse(contents: string, options?: IgnoreOptions): Ignorer {

        options = options || {
            AllowIgnoreNodeModules: false,
            Verbosity: Verbosity.Normal
        };

        const lines = contents.replace('/', '\\')
            .split(/\r?\n/)
            .filter(line => options.AllowIgnoreNodeModules || !line.match(/node_modules[\\\/]?$/i)) //Be careful about ignoring the whole of node_modules! Some packages do this, even though it's redundant when publishing to npm repository
            
        return this.ParseLines(lines, options);
    }

    abstract ParseLines(lines: string[], options: IgnoreOptions): Ignorer;
}