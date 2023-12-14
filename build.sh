#!/usr/local/bin/bash

set -e

mkdir -p build

cd client
npm install
npm run build
cd ..

mkdir -p build/client
rm -rf build/client/*
cp -r client/build/* build/client/
cp -p server/{chordmania.py,requirements.txt,wsgi.py} build/
