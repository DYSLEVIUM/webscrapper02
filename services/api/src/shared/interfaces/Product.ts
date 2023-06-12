export default interface IProduct {
    condition: string;
    image_links: string[];
    link: string;
    name: string;
    price: number;
    quantity_available: number | null;
    shipping_price: number | null;
}
