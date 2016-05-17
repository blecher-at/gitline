#Docker image

To build the image go to this folder and run `docker build -t blecher-at/gitline .`
To run a container from the image use for example `docker run -dP --name "gitline" -e REPO_URL="git@github.com:blecher-at/git2json.git" -e REPO_NAME="Gitline git2json" -v /home/your_user/.ssh:/ssh-keys blecher-at/gitline`