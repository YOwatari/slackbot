.PHONY: build dev lint fix

deploy dev:
	npm run $@

lint fix:
	npm run $@:prettier
