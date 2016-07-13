import {LinedIgnoreParser} from "./ignore-parser";
import {Ignorer, IgnoreOptions, Verbosity} from "../ignorer"
import path = require("path");
var nodeIgnore = require('ignore');

export class NodeIgnoreIgnoreParser extends LinedIgnoreParser {

    ParseLines(lines: string[], options: IgnoreOptions): Ignorer {
        lines = lines.map(line => line.replace("\\", "/"));

        let ignorer = nodeIgnore().add(lines);

        return {
            Accepts: (filepath: string) => {
                filepath = filepath.replace("\\", "/");
                return !!ignorer.filter([filepath]).length;
            },
            Denies: (filepath: string) => {
                filepath = filepath.replace("\\", "/");
                return !ignorer.filter([filepath]).length;
            }
        }
    }

}