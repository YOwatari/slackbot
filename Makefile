up: vendor/bin/ngrok
	$< http 3000

url:
	curl -s http://127.0.0.1:4040/api/tunnels | jq -r '.tunnels[] | select (.proto == "https") | .public_url'

OS   := $(shell uname | tr A-Z a-z)
ARCH := $(if $(filter $(shell uname -a),arm64 aarch64),arm64,amd64)

vendor/bin/ngrok: ngrok.zip
	unzip $< -d $(@D)
	chmod +x $@

ngrok.zip:
	curl -sSL -o $@ https://bin.equinox.io/c/4VmDzA7iaHb/ngrok-stable-$(OS)-$(ARCH).zip

