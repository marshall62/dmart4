export interface Artwork {
    id: number;
    image_url: string;
    midsize_image_url: string;
    thumbnail_image_url: string;
    filename: string;
    title: string;
    media: string;
    category_name: string | null;
    price: string;
    width: number;
    height: number;
    year: number;
    is_sold: boolean | null;
    is_active: boolean;
    mongo_id: string;
    owner: string | null;
  }