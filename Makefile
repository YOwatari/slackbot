.PHONY: build dev tail lint fix

deploy dev tail:
	npm run $@

test:
	npm $@

lint fix:
	npm run $@:prettier
