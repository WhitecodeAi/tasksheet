export default function sortByName(list) {
  if (!Array.isArray(list)) return [];
  return list.slice().sort((a, b) => (String(a?.name || '')).localeCompare(String(b?.name || '')));
}
