.PHONY: build dev tail lint fix

deploy dev tail:
	npm run $@

lint fix:
	npm run $@:prettier
