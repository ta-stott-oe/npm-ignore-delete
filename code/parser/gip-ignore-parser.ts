import {LinedIgnoreParser} from "./ignore-parser";
import {Ignorer, IgnoreOptions, Verbosity} from "../ignorer"
import path = require("path");
var ignoreparser = require('gitignore-parser')

export class GipIgnoreParser extends LinedIgnoreParser {
    ParseLines(lines: string[], options: IgnoreOptions): Ignorer {
        const ignorer = ignoreparser.compile(lines.join("\r\n"));

        return {
            Accepts: (filepath: string) => {
                filepath = filepath.replace('/', '\\');
                var result = ignorer.accepts(filepath);
                if(options.Verbosity == Verbosity.Verbose) console.log(`Accept = ${result}: '${filepath}' in '${path.dirname(filepath) }'`);
                return result;
            },
            Denies: (filepath: string) => {
                filepath = filepath.replace('/', '\\');
                var result = ignorer.denies(filepath);
                if(options.Verbosity == Verbosity.Verbose) console.log(`Deny = ${result}: '${filepath}' in '${path.dirname(filepath) }'`);
                return result;
            }
        }
    }
}