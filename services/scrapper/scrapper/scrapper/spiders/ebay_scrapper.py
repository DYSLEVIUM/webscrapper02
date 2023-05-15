import scrapy
from scrapy.loader import ItemLoader

from ..items import EbayScrapperItem


class EbayScrapperSpider(scrapy.Spider):
    name = "ebay_scrapper"
    allowed_domains = ["ebay.com"]

    def __parse_keywords(self, keywords: list[str]) -> str:
        return "+".join(keywords)

    def __init__(self, keywords, target_price, **kwargs):
        super(EbayScrapperSpider, self).__init__(**kwargs)

        keywords = keywords.split(" ")
        self.parsed_keywords = self.__parse_keywords(keywords)
        self.target_price = float(target_price)

        url = f"https://ebay.com/sch/i.html?_from=R40&_nkw={self.parsed_keywords}&sacat=0&rt=nc"

        self.start_urls = [url]

    def parse(self, response):
        products = response.css("li.s-item.s-item__pl-on-bottom")[
            1:
        ]  # first one is "Shop on eBay"

        for product in products:
            product_page_link = product.css("a.s-item__link::attr(href)").get()

            if product_page_link is not None:
                yield response.follow(product_page_link, self.__parse_product)

        next_page = response.css('a.pagination__next.icon-link::attr("href")').get()
        if next_page is not None:
            yield response.follow(next_page, self.parse)

    def __parse_product(self, response):
        item = ItemLoader(EbayScrapperItem(), response)

        item.add_css(
            "name",
            "h1.x-item-title__mainTitle span.ux-textspans.ux-textspans--BOLD",
        )
        item.add_css("condition", "div.x-item-condition-value span.ux-textspans")
        item.add_css(
            "price",
            "div.x-price-primary span span.ux-textspans",
        )
        item.add_value("link", response.url)
        item.add_css(
            "shipping_price",
            "div.ux-labels-values.ux-labels-values--shipping span.ux-textspans.ux-textspans--BOLD",
        )
        item.add_css(
            "quantity_available", "div.d-quantity__availability span.ux-textspans"
        )

        image_links = []
        for image_link in response.css(
            "div.ux-image-carousel div.ux-image-carousel-item.image"
        ):
            link = image_link.css("img::attr(src)").get()
            if link is None:
                link = image_link.css("img::attr(data-src)").get()
            image_links.append(link)
        item.add_value("image_links", image_links)

        yield item.load_item()
