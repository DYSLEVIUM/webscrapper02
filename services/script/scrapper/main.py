import os
import sys

from scrapper.spiders.ebay_scrapper import EbayScrapperSpider
from scrapy.crawler import CrawlerProcess
from scrapy.utils.project import get_project_settings


def scrape(fileName: str, target_price: float, keywords: list[str]) -> None:
    # don't do anything if we have no keywords
    if len(keywords) == 0:
        return
    
    settings = get_project_settings()

    #! better to use pipeline and store it in database
    settings['FEEDS'] = {
        f'../data/{fileName}.json': {
            'format': 'json',
            'encoding': 'utf8',
            'store_empty': False,
            # 'item_classes': [MyItemClass1, 'myproject.items.MyItemClass2'],
            'fields': None,
            'indent': 4,
            'item_export_kwargs': {
                'export_empty_fields': True,
            },
            'overwrite': True
        },
        
        f'../data/{fileName}.csv': {
            'format': 'csv',
            'encoding': 'utf8',
            'store_empty': False,
            # 'item_classes': [MyItemClass1, 'myproject.items.MyItemClass2'],
            'fields': None,
            'item_export_kwargs': {
                'export_empty_fields': True,
            },
            'overwrite': True
        },
    }

    process = CrawlerProcess(settings)

    args = {
        "keywords": " ".join(keywords),
        "target_price": target_price,
    }

    # Add your Spider to the process with the arguments
    process.crawl(EbayScrapperSpider, **args)
    
    # print('Starting Scrape')
    process.start()


if __name__ == "__main__":
    scrape(sys.argv[1], float(sys.argv[2]), sys.argv[3:])