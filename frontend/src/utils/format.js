
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

// Chỉ lấy ảnh từ src/assets hoặc ảnh được API cung cấp
const resolveLocalAssetImage = (image) => {
  if (typeof image !== "string" || !image.trim()) return null;

  const imagePath = image.trim().replace(/\\/g, "/").split(/[?#]/, 1)[0];

  // Không lấy ảnh upload từ tên file local
  if (/(?:^|\/)uploads?\//i.test(imagePath)) return null;

  const filename = imagePath.split("/").pop().toLowerCase();
  const assetUrl = LOCAL_ASSET_IMAGES.get(filename);

  if (
    assetUrl &&
    (
      imagePath === filename ||
      /(?:^|\/)(?:frontend\/)?src\/assets\//i.test(imagePath)
    )
  ) {
    return assetUrl;
  }

  return null;
};

export const resolveProductImage = (image) => {
  if (typeof image !== "string" || !image.trim()) return null;

  const value = image.trim();
  const localAssetImage = resolveLocalAssetImage(value);

  if (localAssetImage) return localAssetImage;

  if (/^https?:\/\//i.test(value)) return value;

  if (value.startsWith("/")) {
    return `http://localhost:8081${value}`;
  }

  return `http://localhost:8081/images/${value}`;
};

export const resolveCategoryImage = (image) => {
  if (typeof image !== "string" || !image.trim()) return null;

  const value = image.trim();
  const localAssetImage = resolveLocalAssetImage(value);

  if (localAssetImage) return localAssetImage;

  if (/^https?:\/\//i.test(value)) return value;

  if (value.startsWith("/")) {
    return `http://localhost:8081${value}`;
  }

  return `http://localhost:8081/images/${value}`;
};
