export const SUGAR_OPTIONS = [
  { value: "0%", label: "0% đường" },
  { value: "50%", label: "50% đường" },
  { value: "100%", label: "100% đường" },
];

export const ICE_OPTIONS = [
  { value: "NONE", label: "Không đá" },
  { value: "LESS", label: "Ít đá" },
  { value: "NORMAL", label: "Bình thường" },
];

export const TOPPING_OPTIONS = [
  { value: "PEARL", label: "Trân châu", price: 20000 },
  { value: "COFFEE_JELLY", label: "Thạch cà phê", price: 7000 },
  { value: "CHEESE_CREAM", label: "Kem cheese", price: 10000 },
];

export const isCakeProduct = (product) =>
  [product?.name, product?.categoryName, product?.category?.name, product?.category]
    .filter((value) => typeof value === "string")
    .some((value) =>
      value.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .toLowerCase().includes("banh")
    );

export const getToppingAmount = (toppings = []) =>
  TOPPING_OPTIONS.reduce(
    (total, topping) =>
      toppings.includes(topping.value) ? total + topping.price : total,
    0,
  );

export const getConfiguredUnitPrice = (basePrice, toppings = []) =>
  Number(basePrice || 0) + getToppingAmount(toppings);

export const getCustomizationSummary = (item) => {
  const sugar = SUGAR_OPTIONS.find(
    (option) => option.value === item.sugarLevel,
  )?.label || "100% đường";
  const ice = ICE_OPTIONS.find(
    (option) => option.value === item.iceLevel,
  )?.label || "Bình thường";
  const toppings = TOPPING_OPTIONS
    .filter((option) => item.toppings?.includes(option.value))
    .map((option) => option.label);

  return [sugar, ice, ...toppings].join(" · ");
};
