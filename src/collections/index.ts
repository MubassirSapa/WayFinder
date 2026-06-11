import type { CollectionConfig } from "payload";

import { Media } from "./Media";
import { Users } from "./Users";
import { Floors } from "./map/Floors";
import { MapNodes } from "./map/MapNodes";
import { MapObjects } from "./map/MapObjects";
import { PathEdges } from "./map/PathEdges";

export { Floors, MapNodes, MapObjects, Media, PathEdges, Users };

export const collections: CollectionConfig[] = [
  Users,
  Media,
  Floors,
  MapObjects,
  MapNodes,
  PathEdges,
];
