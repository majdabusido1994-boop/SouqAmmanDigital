// Routes to the correct specialized screen based on shop/product category

export function getShopScreen(category) {
  switch (category) {
    case 'fashion':
    case 'accessories':
      return 'FashionShop';
    case 'food':
      return 'FoodShop';
    case 'handmade':
    case 'art':
      return 'HandcraftShop';
    default:
      return 'ShopDetail';
  }
}

export function getProductScreen(category) {
  switch (category) {
    case 'fashion':
    case 'accessories':
      return 'FashionProduct';
    case 'food':
      return 'FoodProduct';
    case 'handmade':
    case 'art':
      return 'HandcraftProduct';
    default:
      return 'ProductDetail';
  }
}

export function navigateToShop(navigation, shop) {
  const screen = getShopScreen(shop.category);
  navigation.navigate(screen, { shopId: shop._id });
}

export function navigateToProduct(navigation, product) {
  const screen = getProductScreen(product.category);
  navigation.navigate(screen, { productId: product._id });
}
