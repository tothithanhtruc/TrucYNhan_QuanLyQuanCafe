const DEFAULT_CATEGORY_IMAGES = [
  "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=80",
  "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=80",
  "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=300&q=80",
  "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300&q=80",
  "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=300&q=80",
  "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=80"
];

const LOCAL_ASSET_IMAGES = new Map(
  Object.entries(
    import.meta.glob("../assets/*.{avif,gif,jpeg,jpg,png,svg,webp}", {
      eager: true,
      import: "default",
    })
  ).map(([path, url]) => [path.split("/").pop().toLowerCase(), url])
);

export const formatCurrency = (amount) => {
  if (amount == null) return "0đ";
  return Number(amount).toLocaleString("vi-VN") + "đ";
};

const resolveLocalAssetImage = (image) => {
  if (typeof image !== "string" || !image.trim()) return null;

  const imagePath = image.trim().replace(/\\/g, "/").split(/[?#]/, 1)[0];
  if (/(?:^|\/)uploads\//i.test(imagePath)) return null;

  const filename = imagePath.split("/").pop().toLowerCase();
  const assetUrl = LOCAL_ASSET_IMAGES.get(filename);

  if (
    assetUrl &&
    (imagePath === filename ||
      /(?:^|\/)(?:frontend\/)?src\/assets\//i.test(imagePath))
  ) {
    return assetUrl;
  }

  return null;
};

export const resolveProductImage = (image) => {
  const localAssetImage = resolveLocalAssetImage(image);
  if (localAssetImage) return localAssetImage;

  if (image && typeof image === "string") {
    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }
    if (image.startsWith("/")) {
      return `http://localhost:8081${image}`;
    }
    return `http://localhost:8081/images/${image}`;
  }
  return null;
};

export const resolveCategoryImage = (image, id = 0) => {
  const localAssetImage = resolveLocalAssetImage(image);
  if (localAssetImage) return localAssetImage;

  if (image && typeof image === "string") {
    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }
    return `http://localhost:8081/images/${image}`;
  }
  const index = Math.abs(Number(id) || 0) % DEFAULT_CATEGORY_IMAGES.length;
  return DEFAULT_CATEGORY_IMAGES[index];
};
