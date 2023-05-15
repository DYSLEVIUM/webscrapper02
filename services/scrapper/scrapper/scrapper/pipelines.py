# Define your item pipelines here
#
# Don't forget to add your pipeline to the ITEM_PIPELINES setting
# See: https://docs.scrapy.org/en/latest/topics/item-pipeline.html


# useful for handling different item types with a single interface
from itemadapter import ItemAdapter


class ScrapperPipeline(object):
    def process_item(self, item, spider):
        item.setdefault("name", None)
        item.setdefault("condition", None)
        item.setdefault("price", None)
        item.setdefault("link", None)
        item.setdefault("image_links", None)
        item.setdefault("shipping_price", None)
        item.setdefault("quantity_available", None)
        return item
