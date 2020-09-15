include .env

.PHONY: start build image container

word-dot = $(word $2,$(subst ., ,$1))

VERSION := $(shell node -p "require('./package.json').version")

default: container

dev:
	@echo "Up App..."
	npm run dev

dev:
	@echo "Build and run App..."
	npm run prod

up : dev

build:
	@echo "Starting building prod mode..."
	rm -rf dist && npm run build

image:
	@echo "Starting building image prod mode..."
	env $$(cat .env | grep ^[A-Z] | xargs) docker build -t $(DOCKER_REGISTRY) .
	docker tag $(DOCKER_REGISTRY) $(DOCKER_REGISTRY):$(call word-dot,$(VERSION),1)
	docker tag $(DOCKER_REGISTRY) $(DOCKER_REGISTRY):$(call word-dot,$(VERSION),1).$(call word-dot,$(VERSION),2)
	docker tag $(DOCKER_REGISTRY) $(DOCKER_REGISTRY):$(call word-dot,$(VERSION),1).$(call word-dot,$(VERSION),2).$(call word-dot,$(VERSION),3)

container: build image

push:
	env $$(cat .env | grep ^[A-Z] | xargs) docker push $(DOCKER_REGISTRY)

%:
	@:
