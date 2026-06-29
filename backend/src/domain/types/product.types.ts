export type ProductCondition = 'new' | 'good' | 'regular';
export type ProductStatus   = 'available' | 'reserved' | 'sold';
export type ProductCategory =
  | 'microcontrollers'
  | 'sensors'
  | 'memory'
  | 'displays'
  | 'cables'
  | 'power'
  | 'other';

export interface Product {
  id:            string;
  seller_id:     string;
  university_id: string;
  name:          string;
  description:   string | null;
  price:         number;
  is_donation:   boolean;
  category:      ProductCategory;
  condition:     ProductCondition;
  status:        ProductStatus;
  image_url:       string;
  image_public_id: string | null;
  created_at:      Date;
  updated_at:      Date;
}

export interface CreateProductDTO {
  name:             string;
  description?:     string;
  price:            number;
  is_donation:      boolean;
  category:         ProductCategory;
  condition:        ProductCondition;
  image_url:        string;
  image_public_id?: string;
}

export interface ProductFilters {
  category?:    ProductCategory;
  condition?:   ProductCondition;
  is_donation?: boolean;
  search?:      string;
}
