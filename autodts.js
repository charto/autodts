// This file is part of autodts, copyright (C) 2015 BusFaster Ltd.
// Released under the MIT license, see LICENSE.

var fs = require('fs');
var path = require('path');

/** Read configuration file in JSON format.
  * @param {string} confPath Path of file to read.
  * @return {Object.<string, *>} File contents. */
function readConf(confPath) {
	try {
		var confData = fs.readFileSync(confPath);
	} catch(err) {
		console.error(err);
		throw('Error reading ' + confPath);
	}

	try {
		var conf = JSON.parse(confData);
	} catch(err) {
		console.error(err);
		throw('Error parsing JSON from ' + confPath);
	}

	return(conf);
}

// Get paths to configuration files from the command line or set them to default values.
var confPath = process.argv[2] || '.';
var basePath = process.argv[3] || '.';
var outPath = process.argv[4] || './index.d.ts';

confPath = path.resolve('.', confPath);
basePath = path.resolve('.', basePath);
outPath = path.resolve('.', outPath);

var tsconfigPath = path.join(confPath, 'tsconfig.json');
var packagePath = path.join(confPath, 'package.json');

if(!fs.statSync(confPath).isDirectory() || !fs.statSync(tsconfigPath).isFile() || !fs.statSync(packagePath).isFile()) {
	throw('Input path is not a directory containing package.json and tsconfig.json: ' + confPath);
}

var tsconfigData = readConf(tsconfigPath);
var packageData = readConf(packagePath);

var generatorConf = {
	name: packageData.name,
	baseDir: basePath,
	files: tsconfigData.files.map(function(filePath) {
		return(path.relative(basePath, path.resolve(path.dirname(tsconfigPath), filePath)));
	}),
	out: outPath
};

require('dts-generator').generate(generatorConf);
