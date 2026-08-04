// Crossing a floor via stairs/elevator/escalator has real-world friction beyond
// the connector's own short footprint distance (CROSS_FLOOR_DEFAULT_DISTANCE_METERS
// in floor-links/lib/crossFloorConnect.ts) — without this, a route can bounce
// through a floor and back just because a connector's flat distance happens to be
// cheaper than a same-floor walk.
export const FLOOR_CHANGE_PENALTY_METERS = 12;
