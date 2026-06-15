IMAGE_REPO ?= repo-url
USERNAME ?= username

build:
	docker build -t sre-bot-collector:v0.1 -f collector/Dockerfile .
	docker build -t sre-bot-agent:v0.1 -f agent/Dockerfile .
	docker build -t sre-bot-aggregator:v0.1 -f aggregator/Dockerfile .
	docker build -t sre-bot-detector:v0.1 -f detector/Dockerfile .

push:
	docker login -u $(USERNAME)
	docker tag sre-bot-collector:v0.1 $(IMAGE_REPO)/sre-bot-collector:v0.1
	docker push $(IMAGE_REPO)/sre-bot-collector:v0.1
	docker tag sre-bot-agent:v0.1 $(IMAGE_REPO)/sre-bot-agent:v0.1
	docker push $(IMAGE_REPO)/sre-bot-agent:v0.1
	docker tag sre-bot-aggregator:v0.1 $(IMAGE_REPO)/sre-bot-aggregator:v0.1
	docker push $(IMAGE_REPO)/sre-bot-aggregator:v0.1
	docker tag sre-bot-detector:v0.1 $(IMAGE_REPO)/sre-bot-detector:v0.1
	docker push $(IMAGE_REPO)/sre-bot-detector:v0.1

up:
	docker-compose up -d

down:
	docker-compose down

helm-install:
	helm install sre-bot ./helm/sre-bot

helm-uninstall:
	helm uninstall sre-bot

lint:
	helm lint helm/sre-bot