import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: 'http://scrapper.com',
            lastModified: new Date(),
        },
        {
            url: 'http://scrapper.com/script',
            lastModified: new Date(),
        },
    ];
}
