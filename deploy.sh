#!/bin/bash
echo Running $0 from $(pwd) - for branch $1

mkdir .deploy
cp -R ../dist .
cd .deploy

git init
git config user.name "Travis-CI"
git config user.email "token-travisci@blecher.at"
git remote add target "http://$GH_TOKEN@github.com/blecher-at/gitline.git"
git checkout $1

cp -R ../dist .
git add -A
git commit -m "Automatic deploy of pages to $1"
git push target HEAD
