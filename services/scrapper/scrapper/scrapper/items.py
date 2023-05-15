# Define here the models for your scraped items
#
# See documentation in:
# https://docs.scrapy.org/en/latest/topics/items.html

import re

import scrapy
from itemloaders.processors import MapCompose, TakeFirst
from w3lib.html import remove_tags


def sanitize(value: str) -> str:
    return value.strip().replace("$", "").replace(",", "")


def extract_numbers(value: str) -> float:
    numbers = re.findall(r"\d+(?:\.\d+)?", value)
    return float(numbers[0]) if numbers else None


def shipping_formatter(value: str) -> float:
    return 0 if value == "Free" else extract_numbers(value)


def convert_to_int(value: float) -> int:
    return int(value)


class EbayScrapperItem(scrapy.Item):
    name = scrapy.Field(
        input_processor=MapCompose(remove_tags), output_processor=TakeFirst()
    )
    condition = scrapy.Field(
        input_processor=MapCompose(remove_tags, sanitize), output_processor=TakeFirst()
    )
    price = scrapy.Field(
        input_processor=MapCompose(remove_tags, sanitize, extract_numbers),
        output_processor=TakeFirst(),
    )
    link = scrapy.Field(
        input_processor=MapCompose(remove_tags), output_processor=TakeFirst()
    )
    image_links = scrapy.Field(input_processor=MapCompose(remove_tags))

    shipping_price = scrapy.Field(
        input_processor=MapCompose(remove_tags, sanitize, shipping_formatter),
        output_processor=TakeFirst(),
    )
    quantity_available = scrapy.Field(
        input_processor=MapCompose(
            remove_tags, sanitize, extract_numbers, convert_to_int
        ),
        output_processor=TakeFirst(),
    )
