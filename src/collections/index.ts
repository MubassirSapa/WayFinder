import type { CollectionConfig } from "payload";

import { Admins } from "./Admins";
import { Buildings } from "./Buildings";
import { Invitations } from "./Invitations";
import { Media } from "./Media";
import { Users } from "./Users";
import { Organizations } from "./Organizations";
import { Floors } from "./map/Floors";
import { MapNodes } from "./map/MapNodes";
import { MapObjects } from "./map/MapObjects";
import { PathEdges } from "./map/PathEdges";

export { Admins, Buildings, Floors, Invitations, MapNodes, MapObjects, Media, Organizations, PathEdges, Users };

export const collections: CollectionConfig[] = [
  Admins,
  Users,
  Organizations,
  Buildings,
  Invitations,
  Media,
  Floors,
  MapObjects,
  MapNodes,
  PathEdges,
];
