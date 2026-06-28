IMAGE_REPO ?= repo-url
USERNAME ?= username

build-collector:
	docker build -t sre-bot-collector:v0.1 -f collector/Dockerfile .
	kind load docker-image sre-bot-collector:v0.1 --name sre-bot

build-agent:
	docker build -t sre-bot-agent:v0.1 -f agent/Dockerfile .
	kind load docker-image sre-bot-agent:v0.1 --name sre-bot

build-aggregator:
	docker build -t sre-bot-aggregator:v0.1 -f aggregator/Dockerfile .
	kind load docker-image sre-bot-aggregator:v0.1 --name sre-bot

build-detector:
	docker build -t sre-bot-detector:v0.1 -f detector/Dockerfile .
	kind load docker-image sre-bot-detector:v0.1 --name sre-bot

build-dashboard:
	docker build -t kavishbaghel/sre-bot-dashboard:latest -f dashboard/Dockerfile .
	kind load docker-image kavishbaghel/sre-bot-dashboard:latest --name sre-bot

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
	docker tag sre-bot-dashboard:v0.1 $(IMAGE_REPO)/sre-bot-dashboard:v0.1
	docker push $(IMAGE_REPO)/sre-bot-dashboard:v0.1

helm-upgrade:
	helm upgrade sre-bot ./helm/sre-bot


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