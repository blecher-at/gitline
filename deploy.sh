#!/bin/bash
echo Running $0 from $(pwd) - for branch $1



git clone -b $1 http://$GH_TOKEN@github.com/blecher-at/gitline.git .deploy
cd .deploy
cp -R ../dist .

git config user.name "Travis-CI"
git config user.email "token-travisci@blecher.at"

cp -R ../dist .
git add -A
git commit -m "Automatic deploy of pages to $1"
git push target HEAD
