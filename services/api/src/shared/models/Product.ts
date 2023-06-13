import { IProduct } from '../interfaces';
import { writeCsvFile } from '../utils/file';
import { logger } from '../utils/logger';

export class Product implements IProduct {
    condition: string;
    image_links: string[];
    link: string;
    name: string;
    price: number;
    quantity_available: number | null;
    shipping_price: number | null;

    [key: string]: any;

    constructor(product: IProduct) {
        this.condition = product.condition;
        this.image_links = product.image_links;
        this.link = product.link;
        this.name = product.name;
        this.price = product.price;
        this.quantity_available = product.quantity_available;
        this.shipping_price = product.shipping_price;
    }

    equals(other: Product): boolean {
        return (
            this.condition === other.condition &&
            // this.link === other.link
            this.name === other.name &&
            this.price === other.price
            // this.quantity_available === other.quantity_available &&
            // this.shipping_price === other.shipping_price
        );
    }

    static async exportToCsv(
        products: Product[],
        filePath: string
    ): Promise<string> {
        const headings = Object.keys(products.length ? products[0] : {});

        // Convert products to an array of plain objects
        const productData = products.map((product) => {
            const productObject: any = {}; // Use 'any' type for dynamic assignment

            // Assign values to the properties dynamically
            Object.keys(product).forEach((key) => {
                const value = product[key];
                let formattedValue: string;

                if (value === null) {
                    // formattedValue = 'Null,'; // Convert null
                    formattedValue = 'Null'; // Convert null
                } else if (typeof value === 'string') {
                    // formattedValue = `"${value}"`; // Enclose string in double quotes if it contains a comma
                    // formattedValue = `"${value.replace(/"/g, '""')}"`; // Escape double quotes within the string
                    if (value.includes(',') || value.includes('"')) {
                        formattedValue = `"${value.replace(/"/g, '""')}"`; // Escape double quotes and enclose within double quotes
                    } else {
                        formattedValue = value;
                    }
                } else if (Array.isArray(value)) {
                    formattedValue = value.join(';'); // Join array elements with a delimiter (e.g., semicolon)
                } else {
                    formattedValue = String(value);
                }

                productObject[key] = formattedValue;
                // productObject[key] = value !== null ? String(value) : 'Null,'; // Convert null
            });

            return productObject;
        });

        // Prepend the headings to the data array
        const dataWithHeadings = [headings, ...productData];

        logger.info('Writing data to CSV to send.');

        return await writeCsvFile(filePath, dataWithHeadings);
    }
}
