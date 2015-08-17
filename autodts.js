// This file is part of autodts, copyright (C) 2015 BusFaster Ltd.
// Released under the MIT license. There is NO WARRANTY OF ANY KIND.

var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var link = require('@lib/autolink');

function parsePackage(packagePath) {
	var packageData = link.readConf(packagePath);
	var name;
	var definition;
	var dependencies;

	name = packageData.name;

	if(typeof(packageData.typescript) == 'object') {
		definition = packageData.typescript.definition;
	}

	if(typeof(packageData.dependencies) == 'object') {
		dependencies = Object.keys(packageData.dependencies);
	}

	return({
		name: name,
		dependencies: dependencies,
		definition: definition
	});
}

function parseTsconfig(tsconfigPath) {
	var tsconfigData = link.readConf(tsconfigPath);
	var outDir;

	if(typeof(tsconfigData.compilerOptions) == 'object') {
		outDir = tsconfigData.compilerOptions.outDir;
	}

	return({
		outDir: outDir,
		files: tsconfigData.files
	});
}

function doLink(conf, outputPath) {
	var outputDir = path.dirname(outputPath);
	var output = [
		'\/\/ Automatically generated file. Edits will be lost.'
	];

	if(conf.dependencies) {
		conf.dependencies.forEach(function(depend) {
			var entryPath = link.resolve(depend);

			if(!entryPath) {
				console.warn('Warning: Unable to find a required module: ' + depend);
				return;
			}

			var info = link.findModuleConf(entryPath, ['package.json']);
			var confPath = info.confPath;
			var conf = parsePackage(confPath);

			if(!conf.definition) return;

			var definitionPath = path.resolve(path.dirname(confPath), conf.definition);

			output.push([
				'\/\/\/ <reference path="',
				path.relative(outputDir, definitionPath),
				'" />'
			].join(''));
		});
	}

	output.push('');

	mkdirp.sync(outputDir);
	fs.writeFileSync(outputPath, output.join('\n'));
}

function doGenerate(packageConf, basePath) {
	var tsconfigPath = path.resolve(basePath, 'tsconfig.json');
	var tsConf = parseTsconfig(tsconfigPath);

	// Assume main TypeScript compiler output file name comes from the first file listed in tsconfig.json.
	// Remove its .ts extension because the compiler will change it.

	var tsBaseName = path.basename(tsConf.files[0]).replace(/\.ts$/i, '');
	var compiledPath = path.join(path.relative(basePath, tsConf.outDir), tsBaseName);

	var generatorConf = {
		name: packageConf.name,
		baseDir: compiledPath,
		files: [compiledPath + '.d.ts'],
		out: packageConf.definition
	};

	console.log([
		'autodts-generator --name',
		generatorConf.name,
		'--baseDir',
		generatorConf.baseDir,
		'--out',
		generatorConf.out,
		generatorConf.files.join(' ')
	].join(' '));

	require(link.resolve('@lib/autodts-generator', '.')).generate(generatorConf);
}

var argv = require('minimist')(process.argv.slice(2));

var action = argv._[0];

// Get path to configuration files from the command line or set it to a default value.
var basePath = argv._[1] || '.';
var packagePath = path.resolve(basePath, 'package.json');

var packageConf = parsePackage(packagePath);

if(action == 'link') {
	var outputPath = path.resolve(basePath, argv['out'] || 'typings/auto.d.ts');
	doLink(packageConf, outputPath);
}

if(action == 'generate') {
	doGenerate(packageConf, basePath);
}
