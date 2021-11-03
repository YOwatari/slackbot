IMAGE     := yowatari/slackbot
CONTAINER := slackbot

all: build run

run: stop
	docker run -d --restart=always --env-file $(CURDIR)/.env --name $(CONTAINER) $(IMAGE)

build:
	pack build $(IMAGE) --builder heroku/buildpacks:20

stop:
	-docker rm -f $(CONTAINER)

logs:
	docker logs $(CONTAINER) -f
