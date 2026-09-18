const FAVORITES_KEY = 'l_studio_favorites';

export function getFavoriteIds(): Set<string> {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return new Set<string>();
    const list = JSON.parse(raw);
    return new Set<string>(Array.isArray(list) ? list : []);
  } catch {
    return new Set<string>();
  }
}

export function toggleFavoriteId(id: string): { isFav: boolean; newFavorites: Set<string> } {
  const favs = getFavoriteIds();
  const isFav = favs.has(id);
  if (isFav) {
    favs.delete(id);
  } else {
    favs.add(id);
  }
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(favs)));
  } catch (e) {
    console.error('Failed to save favorites to localStorage', e);
  }
  return { isFav: !isFav, newFavorites: favs };
}
