import os
import sys

from scrapper.spiders.ebay_scrapper import EbayScrapperSpider
from scrapy.crawler import CrawlerProcess
from scrapy.utils.project import get_project_settings


def scrape(target_price: float, keywords: list[str]) -> None:
    # don't do anything if we have no keywords
    if len(keywords) == 0:
        return

    process = CrawlerProcess(get_project_settings())

    args = {
        "keywords": " ".join(keywords),
        "target_price": target_price,
    }

    # Add your Spider to the process with the arguments
    process.crawl(EbayScrapperSpider, **args)
    process.start()


if __name__ == "__main__":
    # create logs dir
    os.mkdir('../data/logs')
    
    scrape(float(sys.argv[1]), sys.argv[2:])
