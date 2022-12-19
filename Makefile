IMAGE     := yowatari/slackbot
CONTAINER := slackbot

all: build run

run: stop
	docker run -d --restart=always --init --env-file $(CURDIR)/.env --name $(CONTAINER) $(IMAGE)

build:
	docker buildx build -t $(IMAGE) --load .

stop:
	-docker rm -f $(CONTAINER)

logs:
	docker logs $(CONTAINER) -f
