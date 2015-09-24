import yargs = require('yargs');
import Q = require('q')
import nio = require('./npm-ignore-operation')

var argv = yargs
    .demand(1)
    .argv;


Q.longStackSupport = true;

var op = new nio.NpmIgnoreOperation(nio.Verbosity.Normal);
op.Execute(argv._[0])
	.done(() => {
		console.log(`We're done here`);
	});
