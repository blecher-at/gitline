#!/bin/bash

set -e # exit immediately on non-zero return code
 
REPO_URL=${REPO_URL:-"https://github.com/blecher-at/gitline.git"}
REPO_NAME=${REPO_NAME:-"Gitline"}
USE_CRON=${USE_CRON:-"YES"}
USE_GITHUB=${USE_GITHUB:-"NO"}

CRON_FILE="git2json-cron"
REPO_DEST="/repo"
GITLINE_DEST="/gitline"
SSH_KEY_DEST="/ssh-keys"

git config --global http.sslVerify false

if [ -d $SSH_KEY_DEST ]; then
	echo "Copying SSH folder"
	cp -r $SSH_KEY_DEST /root/.ssh
	chmod 400 /root/.ssh
fi

if [[ $USE_GITHUB != "NO" ]]; then
	echo "Using GitHub"
	cp $GITLINE_DEST/src/demo/html/github.html $GITLINE_DEST/src/demo/html/index.html	
else
	echo "Cloning repository"
	mkdir $REPO_DEST
	git clone $REPO_URL $REPO_DEST 

	echo "Creating data file"
	JOB="export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin && cd $REPO_DEST && git pull; git json > /tmp/repo.json && cp /tmp/repo.json $GITLINE_DEST/dist/data/repo.json"
	mkdir -p $GITLINE_DEST/dist/data
	eval $JOB
	cp $GITLINE_DEST/dist/data/repo.json $GITLINE_DEST/src/test/data/repo.json
	sed -i 's/example02/repo/g' $GITLINE_DEST/src/demo/html/index.html

	if [[ $USE_CRON == "YES" ]]; then
		echo "Setting up cron job"
		cd /etc/cron.d
		touch $CRON_FILE
		chmod 0644 $CRON_FILE
		echo "* * * * * root $JOB" >> $CRON_FILE
		echo "# An empty line is required at the end of the file" >> $CRON_FILE
		cron
	fi
fi

echo "Configuring HTML page"
sed -i "s/Gitline.*Example/$REPO_NAME/g" $GITLINE_DEST/src/demo/html/index.html
sed -i "/withHeader/c\.withHeader('$REPO_NAME')" $GITLINE_DEST/src/demo/html/index.html

echo "Starting Gitline server"
cd $GITLINE_DEST
gulp run
