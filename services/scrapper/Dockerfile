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

# scrapper
FROM python:alpine

RUN apk update && apk upgrade
RUN apk add --update --no-cache --virtual .build-deps gcc libc-dev linux-headers libffi-dev
RUN python3 -m pip install --upgrade pip

WORKDIR /usr/app

COPY . .
COPY --from=builder /usr/app/requirements.txt .

RUN python3 -m pip install -r requirements.txt
RUN apk del .build-deps

RUN addgroup -g 1001 -S scrapper
RUN adduser -S scrapper -u 1001

RUN mkdir -p data/logs && chown -R scrapper:scrapper data

VOLUME /usr/app/data

WORKDIR /usr/app/scrapper

CMD ["python3", "main.py", "1000", "nvidia gpu 3000"]