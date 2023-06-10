# dependencies
FROM python:alpine AS builder

RUN apk update && apk upgrade
RUN apk add --update --no-cache gcc libc-dev linux-headers libffi-dev

RUN python3 -m pip install --upgrade pip

WORKDIR /usr/app

COPY . .

RUN python3 -m pip install pipreqs pip-tools \
    && pipreqs scrapper --savepath=requirements.in \
    && pip-compile

# script
FROM python:alpine

RUN apk update && apk upgrade
RUN apk add --update --no-cache --virtual .build-deps gcc libc-dev linux-headers libffi-dev
RUN python3 -m pip install --upgrade pip

WORKDIR /usr/app

COPY . .
COPY --from=builder /usr/app/requirements.txt .

RUN python3 -m pip install -r requirements.txt
RUN apk del .build-deps

VOLUME /usr/app/data

WORKDIR /usr/app/scrapper

ENTRYPOINT ["python3", "main.py"]
