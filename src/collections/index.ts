import type { CollectionConfig } from "payload";

import { Media } from "./Media";
import { Users } from "./Users";
import { Organizations } from "./Organizations";
import { Floors } from "./map/Floors";
import { MapNodes } from "./map/MapNodes";
import { MapObjects } from "./map/MapObjects";
import { PathEdges } from "./map/PathEdges";

export { Floors, MapNodes, MapObjects, Media, Organizations, PathEdges, Users };

export const collections: CollectionConfig[] = [
  Users,
  Organizations,
  Media,
  Floors,
  MapObjects,
  MapNodes,
  PathEdges,
];
