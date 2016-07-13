import fs = require('fs')
import Q = require('q')
import path = require('path')
import {IgnoreOptions, Ignorer, Verbosity} from "./ignorer";
import {GipIgnoreParser} from "./parser/gip-ignore-parser";
import {NodeIgnoreIgnoreParser} from "./parser/ni-ignore-parser";

var rimraf = require('rimraf')
var getFolderSize = require('get-folder-size')


export interface DeleteStats {
	DeletedFiles: number;
	DeletedFolders: number;
	DirectorySizeBeforeMB: number;
	DirectorySizeAfterMB: number;
}

export class DeleteOperation {
	
	private deleted : DirectoryItem[];
	
	constructor(private target : string,
		private verbosity: Verbosity,
		private dryRun : boolean = false,
        private allowIgnoreNodeModules = false) {

		this.deleted = [];
	}

	public Execute() : Q.Promise<DeleteStats> {
		
		var folderSizeBefore = 0;
		
		return Q.nfcall<number>(getFolderSize, this.target)
			.then(sizeBytes => {
				folderSizeBefore = sizeBytes;
				return {}
			})
			.then(() => this._Execute(this.target, []))
			.then(() => Q.nfcall<number>(getFolderSize, this.target))
			.then(folderSizeAfterBytes => {
				return {
					DeletedFiles: this.deleted.filter(di => !di.IsDir).length,
					DeletedFolders: this.deleted.filter(di => di.IsDir).length,
					DirectorySizeBeforeMB: folderSizeBefore / 1024 / 1024,
					DirectorySizeAfterMB: folderSizeAfterBytes / 1024 / 1024
				}
			})
	}

	private _Execute(directory: string, ignorers: Ignorer[]): Q.Promise<any> {
		return GetChildren(directory)
			.then(items => {
				var doIgnore: Q.Promise<Ignorer[]> = items.some(di => di.Path.toLowerCase() == '.npmignore')
					? this.ParseIgnoreFile(path.join(directory, '.npmignore'))
						.then(ignorer => ignorers.concat([ignorer]))
					: Q(ignorers);

				var deletedDirs: { [filepath: string]: boolean } = {};

				return doIgnore
					.then(newIgnorers => {
						var stuffToDelete = items.filter(di => newIgnorers.some(ignorer => ignorer.Denies(di.Path)));
						//Delete shit
						return Q.all(stuffToDelete
							.map(di => {
								var fullRelativePath = path.join(directory, di.Path);
								this.deleted.push({Path: fullRelativePath, IsDir: di.IsDir});
								
								if (di.IsDir) {	
									deletedDirs[di.Path] = true;
									console.log(`Deleting directory ${fullRelativePath }`)
									if(this.dryRun) return Q(true);
									else return Q.nfcall(rimraf,fullRelativePath);
									
								}
								else {
									console.log(`Deleting file ${fullRelativePath}`)
									if(this.dryRun) return Q(true);
									else return Q.nfcall(fs.unlink, fullRelativePath);
								}
							})
							)
							.then(() => newIgnorers);
					})
					.then(newIgnorers => {
						var directories = items.filter(di => di.IsDir && !deletedDirs[di.Path]);
						return Q.all(directories.map(d => {
							var dirPath = path.join(directory, d.Path);
							var subIgnorers = newIgnorers.map(i => SubDirectoryIgnore(i, d.Path));
							return this._Execute(dirPath, subIgnorers);
						}));
					});
			});
	}

	private ParseIgnoreFile(filepath: string): Q.Promise<Ignorer> {
		//const parser = new GipIgnoreParser();
		const parser = new NodeIgnoreIgnoreParser();
		return Q.nfcall<string>(fs.readFile, filepath, 'utf8')
			.then(contents => {
				return parser.Parse(contents, {AllowIgnoreNodeModules: this.allowIgnoreNodeModules, Verbosity: this.verbosity});
			})
	}
}

interface DirectoryItem {
	Path: string;
	IsDir: boolean;
}

function GetChildren(directory: string): Q.Promise<DirectoryItem[]> {
	return Q.nfcall<string[]>(fs.readdir, directory)
		.then(items =>
			Q.all(items.map(item =>
				Q.nfcall<fs.Stats>(fs.stat, path.join(directory, item))
					.then(stats => ({ Path: item, IsDir: stats.isDirectory() }))
				)
				)
			);
}

function SubDirectoryIgnore(ignorer: Ignorer, directory: string): Ignorer {
	return {
		Accepts: (filepath: string) => {
			return ignorer.Accepts(path.join(directory, filepath));
		},
		Denies: (filepath: string) => {
			return ignorer.Denies(path.join(directory, filepath));
		}

	}
}