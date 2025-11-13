import { formatItemType } from "./item-type-format";
import { formatNumber } from "./number-format";

export interface NormalisedPrice {
  price: number;
  quantity: number;
}

export function normalisePrice(totalPrice: number, quantity: number): NormalisedPrice {
  if (quantity < 1) return { price: 0, quantity: 0 };

  // E.g. 5 for 1 item
  let normalPrice = {
    price: totalPrice / quantity,
    quantity: 1,
  };

  // Convert 0.125 for 1 item -> 1 for 8 items
  if (normalPrice.price < 1) {
    let multiplier = 1 / normalPrice.price;
    normalPrice.price *= multiplier;
    normalPrice.quantity *= multiplier;
  }

  return normalPrice;
}

export function formatPrice(price: NormalisedPrice, itemType: string): string {
  return `${formatNumber(price.quantity, 2)} '${formatItemType(itemType)}' is worth ${formatNumber(price.price, 2)} diamonds(s)`;
}

export function simpleNormalisedPrice(price: NormalisedPrice) {
  return `${formatNumber(price.quantity, 2)} for ${formatNumber(price.price, 2)} 💎`;
}

