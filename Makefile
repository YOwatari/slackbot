IMAGE := yowatari/slackbot

all: build stop run

run:
	$(MAKE) slackbot.cid

slackbot.cid:
	docker run -d \
	  --restart=always \
	  --env-file $(CURDIR)/.env \
	  --name $(basename $@) \
	  --cidfile $@ \
	  $(IMAGE)

build:
	pack build $(IMAGE) --builder heroku/buildpacks:20

stop:
	-docker rm -f $$(cat slackbot.cid)
	-docker rm -f slackbot
	rm slackbot.cid

logs: slackbot.cid
	docker logs $$(cat $<) -f
