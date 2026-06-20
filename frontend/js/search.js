export const normalizeText = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

export const matchQuery = (item, query) => {
  const q = normalizeText(query);
  if (!q) return true;
  const hay = normalizeText(`${item.name} ${item.description} ${item.category}`);
  return hay.includes(q);
};

export const filterByCategory = (items, category) => {
  if (!category || category === "All") return items;
  return items.filter((i) => i.category === category);
};

export const sortItems = (items, sortKey) => {
  const copy = [...items];
  switch (sortKey) {
    case "price-asc":
      return copy.sort((a, b) => a.price - b.price);
    case "price-desc":
      return copy.sort((a, b) => b.price - a.price);
    case "name-asc":
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return copy;
  }
};

