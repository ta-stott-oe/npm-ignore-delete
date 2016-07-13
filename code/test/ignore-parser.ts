///<reference path="../typings/mocha/mocha.d.ts" />
///<reference path="../typings/chai/chai.d.ts" />
import chai = require('chai')
var expect = chai.expect;

import {NodeIgnoreIgnoreParser} from "../parser/ni-ignore-parser";
import {GipIgnoreParser} from "../parser/gip-ignore-parser";
import path = require("path");

//const parser = new GipIgnoreParser();
const parser = new NodeIgnoreIgnoreParser();

describe('node-ignore Ignore Parser', () => {

	it('Should ignore *.js', () => {
		const ignorer = parser.Parse("**\\*.js");
		const file = path.join(process.cwd(), "test.js")

		expect(ignorer.Denies(file)).to.be.true;
	})

	it('Should ignore *.js without ignoring *.json', () => {
		const ignorer = parser.Parse("**\\*.js");
		const jsFile = path.join(process.cwd(), "test.js");
		const jsonFile = path.join(process.cwd(), "test.json");

		expect(ignorer.Denies(jsFile)).to.be.true;
		expect(ignorer.Accepts(jsonFile)).to.be.true;
	})
})