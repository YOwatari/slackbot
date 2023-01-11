IMAGE     := yowatari/slackbot
CONTAINER := slackbot

all: build run

run: stop
	docker run -d --restart=always --env DISPLAY=host.docker.internal:0.0 --env-file $(CURDIR)/.env --name $(CONTAINER) $(IMAGE)

run_slim: stop
	docker run -d --restart=always --env DISPLAY=host.docker.internal:0.0 --env-file $(CURDIR)/.env --name $(CONTAINER) $(IMAGE) start -- --nochatgpt

build:
	docker buildx build -t $(IMAGE) --load .

stop:
	-docker rm -f $(CONTAINER)

logs:
	docker logs $(CONTAINER) -f
