# Scrapper

## Installation

### Dependencies

```shell
pip install virutalenv pipreqs pip-tools
```

```shell
python -m venv -m .venv

```

So that any package installed will be in this folder

```shell
source .venv/bin/activate
```

```shell
pip install scrapy
```

```shell
scrapy startproject scrapper
```

Run this inside the spiders folder

```shell
scrapy genspider ebayScrapper ebay.com
```

### New shell

```shell
pip install ipython

# add to scrapy.cfg
# [settings]
# shell = ipython
# default = scrapper.settings

scrapy shell
```

```shell
pip install scrapy-user-agents
```

### Generate the requirements

```shell
pipreqs --savepath=requirements.in && pip-compile
```

# Docker

## Build

```shell
docker-compose --env-file=./envs/.env.dev -f ./docker/docker-compose.yaml -f ./docker/docker-compose.dev.yaml build --no-cache
```

## Run

```shell
docker-compose --env-file=./envs/.env.dev -f ./docker/docker-compose.yaml -f ./docker/docker-compose.dev.yaml up
```

## Down

```shell
docker-compose -f ./docker/docker-compose.yaml -f ./docker/docker-compose.dev.yaml down -v

```

## Stats

```shell
docker stats
```
