const DEFAULT_COFFEE_IMAGES = [
  "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500&q=80",
  "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=500&q=80",
  "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=500&q=80",
  "https://images.unsplash.com/photo-1585515320310-259814833e62?w=500&q=80",
  "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&q=80",
  "https://images.unsplash.com/photo-1572119865084-43c285814d63?w=500&q=80",
  "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500&q=80",
  "https://images.unsplash.com/photo-1559525839-8f275eef5ed9?w=500&q=80",
  "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&q=80",
  "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&q=80",
  "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=500&q=80",
  "https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=500&q=80"
];

const DEFAULT_CATEGORY_IMAGES = [
  "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=80",
  "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=80",
  "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=300&q=80",
  "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300&q=80",
  "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=300&q=80",
  "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=80"
];

export const formatCurrency = (amount) => {
  if (amount == null) return "0đ";
  return Number(amount).toLocaleString("vi-VN") + "đ";
};

export const resolveProductImage = (image, id = 0) => {
  if (image && typeof image === "string") {
    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }
    if (image.startsWith("/")) {
      return `http://localhost:8081${image}`;
    }
    return `http://localhost:8081/images/${image}`;
  }
  const index = Math.abs(Number(id) || 0) % DEFAULT_COFFEE_IMAGES.length;
  return DEFAULT_COFFEE_IMAGES[index];
};

export const resolveCategoryImage = (image, id = 0) => {
  if (image && typeof image === "string") {
    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }
    return `http://localhost:8081/images/${image}`;
  }
  const index = Math.abs(Number(id) || 0) % DEFAULT_CATEGORY_IMAGES.length;
  return DEFAULT_CATEGORY_IMAGES[index];
};
