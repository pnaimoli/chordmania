#!/usr/local/bin/bash

set -e

mkdir -p build

cd client
npm install --no-audit --no-fund
npm run build
cd ..

mkdir -p build/client
rm -rf build/client/*
cp -r client/build/* build/client/
mkdir -p build/chordmania
cp -p server/{xmlserver.py,requirements.txt,wsgi.py,gunicorn_config.py} build/
cp -p server/chordmania/*.py build/chordmania
