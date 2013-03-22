#!/bin/bash
set -o errexit

configuration=$1
[ -z $configuration ] && configuration=development

builddir=target/$configuration-build

if [ -d $builddir ]; then
	[ -d ${builddir}.old ] && rm -rf ${builddir}.old
	mv $builddir ${builddir}.old
fi

mkdir -p $builddir

function release()
{
	node server/generate.js $builddir

	for file in $(find $builddir -name '*.png'); do
		optipng $file
	done

	for file in $(find $builddir -name '*.css'); do
		node node_modules/clean-css/bin/cleancss $file -o $file
	done

	for file in $(find $builddir -name '*.*'); do
		if [[ "$(file $file --mime-type --brief)" =~ ^text ]]; then
			zopfli $file
			touch -r $file $file.gz
		fi
	done
}

function development()
{
	node server/generate.js $builddir
}

$configuration
