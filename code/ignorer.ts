export interface Ignorer {
	Accepts(filepath: string): boolean;
	Denies(filepath: string): boolean;
}

export enum Verbosity {
	Normal,
	Verbose
}

export interface IgnoreOptions {
    AllowIgnoreNodeModules?: boolean;
    Verbosity: Verbosity;
}