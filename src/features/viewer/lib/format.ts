export function formatBuildingName(buildingId: string) {
  return buildingId
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatObjectType(type: string) {
  return type
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function formatFloorLevel(level: number) {
  if (level === 0) return "Ground floor";
  if (level < 0) return `Lower level ${Math.abs(level)}`;
  return `Level ${level}`;
}
