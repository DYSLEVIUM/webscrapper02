import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: '/script/',
        },
        sitemap: 'http://scrapper.com/sitemap.xml',
    };
}
