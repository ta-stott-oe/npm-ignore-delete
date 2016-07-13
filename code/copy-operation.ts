var copy = require("recursive-copy");
import Q = require("q");
import path = require("path");
import {Ignorer, IgnoreOptions} from "./ignorer";
import fs = require("fs");
import {NodeIgnoreIgnoreParser} from "./parser/ni-ignore-parser";

export interface CopyStats {
    FilesCopied: number;
    FilesSkipped: number;
    MbCopied: number;
}

interface RecursiveCopyResult {
    src: string;
    dest: string;
    stats: fs.Stats;
}

export class CopyOperation {
    constructor(private source: string, private destination: string){
    }

    Execute(): Q.Promise<CopyStats> {

        return this.EnsureDestination()
            .then(() => this.GetIgnorer(this.source))
            .then(ignorer => {
                return this.DoCopy(ignorer);
            })
            .then(results => {
                return {
                    FilesCopied: results.length,
                    FilesSkipped: 0,
                    MbCopied: results.map(r => r.stats.size).reduce((agg, current) => agg + current, 0) / 1000000
                };
            })

        
    }

    private EnsureDestination(): Q.Promise<any> {
        if(fs.existsSync(this.destination)){
            return Q(true);
        }
        else {
            return Q.nfcall<any>(fs.mkdir, this.destination);
        }
    }

    private DoCopy(ignorer: Ignorer): Q.Promise<RecursiveCopyResult[]> {
        const options = {
            overwrite: true,
            filter: (srcPath: string) => {
                const destPath = path.join(this.destination, srcPath);
                
                return ignorer.Accepts(srcPath);
            }
        };
        const promise = copy(this.source, this.destination, options);
        return Q(promise);
    }

    private GetIgnorer(directory: string): Q.Promise<Ignorer> {
        const ignoreFile = path.join(directory, ".npmignore");
        const ignoreParser = new NodeIgnoreIgnoreParser();

        if(!fs.existsSync(ignoreFile)){
            return Q.reject<Ignorer>(`.npmignore file not found at ${directory}.`);
        }

        return Q.nfcall<string>(fs.readFile, ignoreFile, 'utf8')
            .then(contents => {
                return ignoreParser.Parse(contents);
            });
    }
}