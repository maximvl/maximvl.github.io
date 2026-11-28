export type CategoryKey =
  | 'weapons'
  | 'armour'
  | 'jewellery'
  | 'jewels'
  | 'flasks'
  | 'heist'
  | 'tinctures'
  | 'maps';

export interface CategoryInfo {
  key: CategoryKey;
  label: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { key: 'weapons', label: 'Weapons' },
  { key: 'armour', label: 'Armour' },
  { key: 'jewellery', label: 'Jewellery' },
  { key: 'jewels', label: 'Jewels' },
  { key: 'flasks', label: 'Flasks' },
  { key: 'heist', label: 'Heist' },
  { key: 'tinctures', label: 'Tinctures' },
  { key: 'maps', label: 'Maps' }
];

export interface ItemClassInfo {
  key: string;
  label: string;
  category: CategoryKey;
}

/**
 * Item classes used by the Vaal implicit table. The key is the poedb href, so
 * the scraper can match the table's links without maintaining a second list.
 */
export const ITEM_CLASSES: ItemClassInfo[] = [
  { key: 'Claws', label: 'Claws', category: 'weapons' },
  { key: 'Daggers', label: 'Daggers', category: 'weapons' },
  { key: 'Wands', label: 'Wands', category: 'weapons' },
  { key: 'One_Hand_Swords', label: 'One Hand Swords', category: 'weapons' },
  {
    key: 'Thrusting_One_Hand_Swords',
    label: 'Thrusting One Hand Swords',
    category: 'weapons'
  },
  { key: 'One_Hand_Axes', label: 'One Hand Axes', category: 'weapons' },
  { key: 'One_Hand_Maces', label: 'One Hand Maces', category: 'weapons' },
  { key: 'Bows', label: 'Bows', category: 'weapons' },
  { key: 'Staves', label: 'Staves', category: 'weapons' },
  { key: 'Two_Hand_Swords', label: 'Two Hand Swords', category: 'weapons' },
  { key: 'Two_Hand_Axes', label: 'Two Hand Axes', category: 'weapons' },
  { key: 'Two_Hand_Maces', label: 'Two Hand Maces', category: 'weapons' },
  { key: 'Quivers', label: 'Quivers', category: 'weapons' },
  { key: 'Sceptres', label: 'Sceptres', category: 'weapons' },
  { key: 'Rune_Daggers', label: 'Rune Daggers', category: 'weapons' },
  { key: 'Warstaves', label: 'Warstaves', category: 'weapons' },
  { key: 'Fishing_Rods', label: 'Fishing Rods', category: 'weapons' },

  { key: 'Gloves', label: 'Gloves', category: 'armour' },
  { key: 'Boots', label: 'Boots', category: 'armour' },
  { key: 'Body_Armours', label: 'Body Armours', category: 'armour' },
  { key: 'Helmets', label: 'Helmets', category: 'armour' },
  { key: 'Shields', label: 'Shields', category: 'armour' },

  { key: 'Amulets', label: 'Amulets', category: 'jewellery' },
  { key: 'Rings', label: 'Rings', category: 'jewellery' },
  { key: 'Belts', label: 'Belts', category: 'jewellery' },

  { key: 'Jewels', label: 'Jewels', category: 'jewels' },
  { key: 'Abyss_Jewels', label: 'Abyss Jewels', category: 'jewels' },

  { key: 'Life_Flasks', label: 'Life Flasks', category: 'flasks' },
  { key: 'Mana_Flasks', label: 'Mana Flasks', category: 'flasks' },
  { key: 'Hybrid_Flasks', label: 'Hybrid Flasks', category: 'flasks' },
  { key: 'Utility_Flasks', label: 'Utility Flasks', category: 'flasks' },
  {
    key: 'Critical_Utility_Flasks',
    label: 'Critical Utility Flasks',
    category: 'flasks'
  },

  { key: 'Contracts', label: 'Contracts', category: 'heist' },
  { key: 'Blueprints', label: 'Blueprints', category: 'heist' },
  { key: 'Trinkets', label: 'Trinkets', category: 'heist' },

  { key: 'Tinctures', label: 'Tinctures', category: 'tinctures' },
  { key: 'Maps', label: 'Maps', category: 'maps' }
];

export const ITEM_CLASS_BY_KEY: Record<string, ItemClassInfo> = Object.fromEntries(
  ITEM_CLASSES.map((itemClass) => [itemClass.key, itemClass])
);

export const ITEM_CLASS_ORDER: Record<string, number> = Object.fromEntries(
  ITEM_CLASSES.map((itemClass, index) => [itemClass.key, index])
);

export const CATEGORY_ORDER: Record<CategoryKey, number> = Object.fromEntries(
  CATEGORIES.map((category, index) => [category.key, index])
) as Record<CategoryKey, number>;
