FROM ubuntu:latest
MAINTAINER Stephan Blecher <stephan@blecher.at>

RUN apt-get update
RUN apt-get install -y cron git nodejs npm

RUN git clone https://github.com/blecher-at/git2json.git /git2json
RUN cd /git2json && npm link
RUN ln -s `which nodejs` /usr/local/bin/node

RUN git clone https://github.com/blecher-at/gitline.git /gitline
RUN npm install -g gulp
RUN cd /gitline && npm install

ADD ./run.sh /run.sh
RUN chmod 755 /run.sh

EXPOSE 3000

CMD ["/bin/bash", "/run.sh"]

