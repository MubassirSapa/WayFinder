import { getPayload } from "payload";

import config from "../src/payload.config";

const DEMO_PASSWORD = "WayfinderDemo!2026";

type ObjectType =
  | "room"
  | "washroom"
  | "poi"
  | "exit"
  | "section"
  | "shelf";

interface LocationSeed {
  name: string;
  type: ObjectType;
  x: number;
  y: number;
  accessible?: boolean;
}

interface FloorSeed {
  name: string;
  level: number;
  layout: LayoutKey;
  locations: LocationSeed[];
}

type LayoutKey = "diagnostics" | "emergency" | "clinics" | "ward" | "parking" | "market" | "entertainment";

interface Point {
  x: number;
  y: number;
}

interface FloorBlueprint {
  width: number;
  height: number;
  entrance: Point;
  stairs: Point;
  elevator: Point;
  escalator: Point;
  corridors: Array<Point & { width: number; height: number }>;
  waypoints: Point[];
  links: Array<[number, number]>;
}

const BLUEPRINTS: Record<LayoutKey, FloorBlueprint> = {
  diagnostics: {
    width: 1200, height: 760, entrance: { x: 80, y: 380 }, stairs: { x: 1040, y: 170 }, elevator: { x: 1040, y: 285 }, escalator: { x: 1040, y: 400 },
    corridors: [{ x: 70, y: 340, width: 960, height: 80 }, { x: 510, y: 120, width: 80, height: 520 }],
    waypoints: [{ x: 110, y: 380 }, { x: 300, y: 380 }, { x: 550, y: 380 }, { x: 800, y: 380 }, { x: 990, y: 380 }, { x: 550, y: 170 }, { x: 550, y: 590 }],
    links: [[0, 1], [1, 2], [2, 3], [3, 4], [2, 5], [2, 6]],
  },
  emergency: {
    width: 1280, height: 780, entrance: { x: 640, y: 720 }, stairs: { x: 1080, y: 600 }, elevator: { x: 1180, y: 600 }, escalator: { x: 100, y: 590 },
    corridors: [{ x: 585, y: 100, width: 110, height: 630 }, { x: 110, y: 360, width: 1060, height: 100 }, { x: 170, y: 150, width: 80, height: 250 }],
    waypoints: [{ x: 640, y: 700 }, { x: 640, y: 570 }, { x: 640, y: 410 }, { x: 380, y: 410 }, { x: 210, y: 410 }, { x: 900, y: 410 }, { x: 1120, y: 410 }, { x: 640, y: 180 }],
    links: [[0, 1], [1, 2], [2, 3], [3, 4], [2, 5], [5, 6], [2, 7]],
  },
  clinics: {
    width: 1160, height: 800, entrance: { x: 580, y: 740 }, stairs: { x: 500, y: 365 }, elevator: { x: 580, y: 365 }, escalator: { x: 660, y: 365 },
    corridors: [{ x: 160, y: 150, width: 840, height: 75 }, { x: 160, y: 575, width: 840, height: 75 }, { x: 160, y: 150, width: 75, height: 500 }, { x: 925, y: 150, width: 75, height: 500 }, { x: 545, y: 220, width: 70, height: 520 }],
    waypoints: [{ x: 580, y: 720 }, { x: 580, y: 615 }, { x: 580, y: 188 }, { x: 198, y: 188 }, { x: 962, y: 188 }, { x: 198, y: 613 }, { x: 962, y: 613 }, { x: 580, y: 400 }],
    links: [[0, 1], [1, 5], [5, 3], [3, 2], [2, 4], [4, 6], [6, 1], [1, 7], [7, 2]],
  },
  ward: {
    width: 1320, height: 720, entrance: { x: 70, y: 360 }, stairs: { x: 1160, y: 510 }, elevator: { x: 1160, y: 360 }, escalator: { x: 1160, y: 210 },
    corridors: [{ x: 70, y: 320, width: 1080, height: 80 }, { x: 300, y: 120, width: 70, height: 480 }, { x: 650, y: 120, width: 70, height: 480 }, { x: 980, y: 120, width: 70, height: 480 }],
    waypoints: [{ x: 100, y: 360 }, { x: 335, y: 360 }, { x: 685, y: 360 }, { x: 1015, y: 360 }, { x: 1120, y: 360 }, { x: 335, y: 170 }, { x: 335, y: 550 }, { x: 685, y: 170 }, { x: 685, y: 550 }, { x: 1015, y: 170 }, { x: 1015, y: 550 }],
    links: [[0, 1], [1, 2], [2, 3], [3, 4], [1, 5], [1, 6], [2, 7], [2, 8], [3, 9], [3, 10]],
  },
  parking: {
    width: 1400, height: 820, entrance: { x: 90, y: 700 }, stairs: { x: 1240, y: 650 }, elevator: { x: 1320, y: 650 }, escalator: { x: 1240, y: 540 },
    corridors: [{ x: 100, y: 170, width: 1180, height: 90 }, { x: 100, y: 365, width: 1180, height: 90 }, { x: 100, y: 560, width: 1180, height: 90 }, { x: 650, y: 170, width: 90, height: 480 }],
    waypoints: [{ x: 130, y: 700 }, { x: 200, y: 605 }, { x: 695, y: 605 }, { x: 1180, y: 605 }, { x: 695, y: 410 }, { x: 200, y: 410 }, { x: 1180, y: 410 }, { x: 695, y: 215 }, { x: 200, y: 215 }, { x: 1180, y: 215 }],
    links: [[0, 1], [1, 2], [2, 3], [2, 4], [4, 5], [4, 6], [4, 7], [7, 8], [7, 9]],
  },
  market: {
    width: 1260, height: 820, entrance: { x: 630, y: 760 }, stairs: { x: 120, y: 690 }, elevator: { x: 220, y: 690 }, escalator: { x: 1120, y: 690 },
    corridors: [{ x: 575, y: 90, width: 110, height: 680 }, { x: 100, y: 345, width: 1060, height: 110 }, { x: 240, y: 160, width: 780, height: 70 }, { x: 240, y: 570, width: 780, height: 70 }],
    waypoints: [{ x: 630, y: 735 }, { x: 630, y: 605 }, { x: 630, y: 400 }, { x: 300, y: 400 }, { x: 130, y: 400 }, { x: 960, y: 400 }, { x: 1130, y: 400 }, { x: 630, y: 195 }, { x: 300, y: 195 }, { x: 960, y: 195 }],
    links: [[0, 1], [1, 2], [2, 3], [3, 4], [2, 5], [5, 6], [2, 7], [7, 8], [7, 9]],
  },
  entertainment: {
    width: 1240, height: 780, entrance: { x: 80, y: 390 }, stairs: { x: 1080, y: 620 }, elevator: { x: 1160, y: 620 }, escalator: { x: 1080, y: 510 },
    corridors: [{ x: 80, y: 345, width: 1040, height: 90 }, { x: 300, y: 180, width: 80, height: 430 }, { x: 760, y: 180, width: 80, height: 430 }, { x: 300, y: 180, width: 540, height: 70 }, { x: 300, y: 540, width: 540, height: 70 }],
    waypoints: [{ x: 110, y: 390 }, { x: 340, y: 390 }, { x: 800, y: 390 }, { x: 1050, y: 390 }, { x: 340, y: 215 }, { x: 800, y: 215 }, { x: 340, y: 575 }, { x: 800, y: 575 }],
    links: [[0, 1], [1, 2], [2, 3], [1, 4], [4, 5], [5, 2], [1, 6], [6, 7], [7, 2]],
  },
};

const LOCATION_SLOTS: Record<LayoutKey, Array<Point & { width: number; height: number }>> = {
  diagnostics: [
    { x: 110, y: 105, width: 260, height: 190 }, { x: 620, y: 105, width: 260, height: 190 },
    { x: 110, y: 475, width: 300, height: 180 }, { x: 650, y: 475, width: 250, height: 180 },
  ],
  emergency: [
    { x: 100, y: 100, width: 300, height: 230 }, { x: 455, y: 500, width: 250, height: 160 },
    { x: 820, y: 110, width: 320, height: 200 }, { x: 780, y: 500, width: 250, height: 160 },
    { x: 280, y: 500, width: 120, height: 120 },
  ],
  clinics: [
    { x: 275, y: 270, width: 220, height: 125 }, { x: 665, y: 270, width: 220, height: 125 },
    { x: 275, y: 430, width: 220, height: 120 }, { x: 665, y: 430, width: 220, height: 120 },
  ],
  ward: [
    { x: 90, y: 105, width: 190, height: 180 }, { x: 380, y: 105, width: 240, height: 180 },
    { x: 735, y: 265, width: 220, height: 190 }, { x: 750, y: 460, width: 230, height: 150 },
  ],
  parking: [
    { x: 120, y: 275, width: 460, height: 70 }, { x: 800, y: 275, width: 460, height: 70 },
    { x: 860, y: 475, width: 300, height: 65 }, { x: 110, y: 680, width: 260, height: 100 },
  ],
  market: [
    { x: 110, y: 245, width: 390, height: 80 }, { x: 520, y: 470, width: 220, height: 80 },
    { x: 760, y: 245, width: 390, height: 80 }, { x: 800, y: 500, width: 250, height: 140 },
    { x: 280, y: 500, width: 130, height: 120 },
  ],
  entertainment: [
    { x: 110, y: 120, width: 170, height: 190 }, { x: 420, y: 85, width: 300, height: 85 },
    { x: 870, y: 100, width: 250, height: 190 }, { x: 400, y: 630, width: 430, height: 110 },
  ],
};

interface DemoSeed {
  user: { name: string; email: string };
  organization: { name: string; type: "hospital" | "mall" };
  floors: FloorSeed[];
}

const DEMOS: DemoSeed[] = [
  {
    user: { name: "Dr. Maya Chen", email: "maya@wayfinder.demo" },
    organization: { name: "Northstar Medical Centre", type: "hospital" },
    floors: [
      {
        name: "Lower Level - Diagnostics",
        level: -1,
        layout: "diagnostics",
        locations: [
          { name: "MRI Suite", type: "room", x: 180, y: 180 },
          { name: "Medical Imaging", type: "room", x: 420, y: 180 },
          { name: "Laboratory", type: "room", x: 700, y: 180 },
          { name: "Staff Change Room", type: "room", x: 880, y: 500, accessible: false },
        ],
      },
      {
        name: "Ground Floor - Emergency & Welcome",
        level: 0,
        layout: "emergency",
        locations: [
          { name: "Emergency Department", type: "room", x: 170, y: 170 },
          { name: "Main Reception", type: "poi", x: 410, y: 170 },
          { name: "Outpatient Pharmacy", type: "room", x: 700, y: 170 },
          { name: "Family Waiting Area", type: "room", x: 880, y: 500 },
          { name: "Accessible Washroom", type: "washroom", x: 180, y: 500 },
        ],
      },
      {
        name: "Level 1 - Clinics",
        level: 1,
        layout: "clinics",
        locations: [
          { name: "Cardiology Clinic", type: "room", x: 170, y: 170 },
          { name: "Pediatrics Clinic", type: "room", x: 420, y: 170 },
          { name: "Physiotherapy", type: "room", x: 700, y: 170 },
          { name: "Quiet Room", type: "room", x: 880, y: 500 },
        ],
      },
      {
        name: "Level 2 - Patient Care",
        level: 2,
        layout: "ward",
        locations: [
          { name: "Patient Rooms 201-210", type: "section", x: 170, y: 170 },
          { name: "Patient Rooms 211-220", type: "section", x: 450, y: 170 },
          { name: "Nursing Station", type: "poi", x: 720, y: 170 },
          { name: "Family Lounge", type: "room", x: 880, y: 500 },
        ],
      },
    ],
  },
  {
    user: { name: "Jordan Rivera", email: "jordan@wayfinder.demo" },
    organization: { name: "Harbourfront Galleria", type: "mall" },
    floors: [
      {
        name: "P1 - Parking & Services",
        level: -1,
        layout: "parking",
        locations: [
          { name: "Parking Zone A", type: "section", x: 170, y: 170 },
          { name: "Parking Zone B", type: "section", x: 450, y: 170 },
          { name: "EV Charging", type: "poi", x: 720, y: 170 },
          { name: "Parcel Pickup", type: "room", x: 880, y: 500 },
        ],
      },
      {
        name: "Ground Floor - Market Hall",
        level: 0,
        layout: "market",
        locations: [
          { name: "Fresh Market", type: "section", x: 170, y: 170 },
          { name: "Customer Service", type: "poi", x: 430, y: 170 },
          { name: "Fashion Court", type: "section", x: 710, y: 170 },
          { name: "Tech Store", type: "room", x: 880, y: 500 },
          { name: "Family Washroom", type: "washroom", x: 180, y: 500 },
        ],
      },
      {
        name: "Level 1 - Dining & Entertainment",
        level: 1,
        layout: "entertainment",
        locations: [
          { name: "Food Hall", type: "section", x: 170, y: 170 },
          { name: "Cinema", type: "room", x: 440, y: 170 },
          { name: "Arcade", type: "room", x: 710, y: 170 },
          { name: "Rooftop Terrace", type: "poi", x: 880, y: 500 },
        ],
      },
    ],
  },
];

async function seedDemo(demo: DemoSeed) {
  const payload = await getPayload({ config });
  const existingOrganizations = await payload.find({
    collection: "organizations",
    limit: 1,
    overrideAccess: true,
    where: { name: { equals: demo.organization.name } },
  });
  const organization = existingOrganizations.docs[0]
    ? await payload.update({
        collection: "organizations",
        id: existingOrganizations.docs[0].id,
        overrideAccess: true,
        data: demo.organization,
      })
    : await payload.create({
        collection: "organizations",
        overrideAccess: true,
        data: demo.organization,
      });

  const existingUsers = await payload.find({
    collection: "users",
    limit: 1,
    overrideAccess: true,
    where: { email: { equals: demo.user.email } },
  });
  const userData = {
    ...demo.user,
    password: DEMO_PASSWORD,
    role: "user" as const,
    organization: organization.id,
    _verified: true,
  };

  if (existingUsers.docs[0]) {
    await payload.update({
      collection: "users",
      id: existingUsers.docs[0].id,
      overrideAccess: true,
      data: userData,
    });
  } else {
    await payload.create({
      collection: "users",
      overrideAccess: true,
      disableVerificationEmail: true,
      data: userData,
    });
  }

  const buildingId = `building-${organization.id}`;

  // Delete only this demo building's generated map, in dependency order.
  for (const collection of ["path-edges", "map-nodes", "map-objects", "floors"] as const) {
    await payload.delete({
      collection,
      overrideAccess: true,
      where: { buildingId: { equals: buildingId } },
    });
  }

  const connectorNodes: Array<{
    floorId: number;
    stairs: number;
    elevator: number;
    escalator: number;
  }> = [];

  for (const floorSeed of demo.floors) {
    const blueprint = BLUEPRINTS[floorSeed.layout];
    const floor = await payload.create({
      collection: "floors",
      overrideAccess: true,
      data: {
        buildingId,
        name: floorSeed.name,
        level: floorSeed.level,
        width: blueprint.width,
        height: blueprint.height,
        metersPerPixel: 0.05,
        status: "published",
      },
    });

    const createObject = (data: {
      name: string;
      type: "wall" | "hallway" | "stairs" | "elevator" | "escalator" | ObjectType;
      x: number;
      y: number;
      width: number;
      height: number;
      isAccessible?: boolean;
    }) =>
      payload.create({
        collection: "map-objects",
        overrideAccess: true,
        data: {
          ...data,
          buildingId,
          floor: floor.id,
          isSearchable: !["wall", "hallway", "stairs", "elevator", "escalator"].includes(data.type),
        },
      });

    for (const [index, corridor] of blueprint.corridors.entries()) {
      await createObject({ ...corridor, name: `Corridor ${index + 1}`, type: "hallway" });
    }

    // A visible shell makes each plan read as an actual enclosed floor instead of floating rooms.
    for (const wall of [
      { x: 45, y: 45, width: blueprint.width - 90, height: 12 },
      { x: 45, y: blueprint.height - 57, width: blueprint.width - 90, height: 12 },
      { x: 45, y: 45, width: 12, height: blueprint.height - 90 },
      { x: blueprint.width - 57, y: 45, width: 12, height: blueprint.height - 90 },
    ]) {
      await createObject({ ...wall, name: "Perimeter wall", type: "wall", isAccessible: false });
    }

    const connectorObject = (name: string, type: "stairs" | "elevator" | "escalator", point: Point, isAccessible: boolean) =>
      createObject({ name, type, x: point.x - 34, y: point.y - 34, width: 68, height: 68, isAccessible });

    const stairsObject = await connectorObject("Central Stairs", "stairs", blueprint.stairs, false);
    const elevatorObject = await connectorObject("Accessible Elevator", "elevator", blueprint.elevator, true);
    const escalatorObject = await connectorObject("Escalator", "escalator", blueprint.escalator, false);
    const entranceObject = await createObject({ name: "Floor Entrance", type: "exit", x: blueprint.entrance.x - 28, y: blueprint.entrance.y - 28, width: 56, height: 56 });

    const createNode = (data: {
      label: string;
      role: "entrance" | "hallway_point" | "stairs_entry" | "elevator_entry" | "escalator_entry";
      x: number;
      y: number;
      object?: number;
      isAccessible?: boolean;
    }) =>
      payload.create({
        collection: "map-nodes",
        overrideAccess: true,
        data: {
          ...data,
          buildingId,
          floor: floor.id,
          geometryType: "icon",
          isAccessible: data.isAccessible ?? true,
        },
      });

    const entrance = await createNode({ label: "Entrance", role: "entrance", ...blueprint.entrance, object: entranceObject.id });
    const stairs = await createNode({ label: "Central stairs", role: "stairs_entry", ...blueprint.stairs, object: stairsObject.id, isAccessible: false });
    const elevator = await createNode({ label: "Accessible elevator", role: "elevator_entry", ...blueprint.elevator, object: elevatorObject.id });
    const escalator = await createNode({ label: "Escalator", role: "escalator_entry", ...blueprint.escalator, object: escalatorObject.id, isAccessible: false });
    const waypointNodes = [];
    for (const [index, point] of blueprint.waypoints.entries()) {
      waypointNodes.push(await createNode({ label: `Route point ${index + 1}`, role: "hallway_point", ...point }));
    }

    const createEdge = (fromNode: number, toNode: number, distanceMeters: number, isAccessible = true) =>
      payload.create({
        collection: "path-edges",
        overrideAccess: true,
        data: { buildingId, floor: floor.id, fromNode, toNode, type: "walkway", distanceMeters, bidirectional: true, isAccessible },
      });

    const distanceBetween = (a: Point, b: Point) => Math.max(1, Math.round(Math.hypot(a.x - b.x, a.y - b.y) * 0.05));
    const nearestWaypointIndex = (point: Point) => {
      let nearest = 0;
      for (let index = 1; index < blueprint.waypoints.length; index += 1) {
        if (distanceBetween(point, blueprint.waypoints[index]) < distanceBetween(point, blueprint.waypoints[nearest])) nearest = index;
      }
      return nearest;
    };

    for (const [from, to] of blueprint.links) {
      await createEdge(waypointNodes[from].id, waypointNodes[to].id, distanceBetween(blueprint.waypoints[from], blueprint.waypoints[to]));
    }
    for (const connector of [
      { node: entrance, point: blueprint.entrance, accessible: true },
      { node: stairs, point: blueprint.stairs, accessible: false },
      { node: elevator, point: blueprint.elevator, accessible: true },
      { node: escalator, point: blueprint.escalator, accessible: false },
    ]) {
      const nearest = nearestWaypointIndex(connector.point);
      await createEdge(connector.node.id, waypointNodes[nearest].id, distanceBetween(connector.point, blueprint.waypoints[nearest]), connector.accessible);
    }

    for (const [index, location] of floorSeed.locations.entries()) {
      const slot = LOCATION_SLOTS[floorSeed.layout][index];
      const object = await createObject({
        ...location,
        ...slot,
        isAccessible: location.accessible ?? true,
      });
      const roomCenter = { x: slot.x + slot.width / 2, y: slot.y + slot.height / 2 };
      const nearest = nearestWaypointIndex(roomCenter);
      const routePoint = blueprint.waypoints[nearest];
      const accessPoint = {
        x: Math.round(roomCenter.x + (routePoint.x - roomCenter.x) * 0.7),
        y: Math.round(roomCenter.y + (routePoint.y - roomCenter.y) * 0.7),
      };
      const accessNode = await createNode({
        label: `${location.name} access`,
        role: "hallway_point",
        ...accessPoint,
        object: object.id,
        isAccessible: location.accessible ?? true,
      });
      await createEdge(waypointNodes[nearest].id, accessNode.id, distanceBetween(routePoint, accessPoint), location.accessible ?? true);
    }

    connectorNodes.push({ floorId: floor.id, stairs: stairs.id, elevator: elevator.id, escalator: escalator.id });
  }

  for (let index = 0; index < connectorNodes.length - 1; index += 1) {
    const from = connectorNodes[index];
    const to = connectorNodes[index + 1];
    for (const connector of [
      { key: "stairs", type: "stairs", distance: 4, accessible: false },
      { key: "elevator", type: "elevator", distance: 6, accessible: true },
      { key: "escalator", type: "escalator", distance: 5, accessible: false },
    ] as const) {
      await payload.create({
        collection: "path-edges",
        overrideAccess: true,
        data: {
          buildingId,
          floor: from.floorId,
          fromNode: from[connector.key],
          toNode: to[connector.key],
          type: connector.type,
          distanceMeters: connector.distance,
          bidirectional: connector.type !== "escalator",
          isAccessible: connector.accessible,
        },
      });
    }
  }

  return { buildingId, email: demo.user.email, floorCount: demo.floors.length, organization: organization.name };
}

const payload = await getPayload({ config });

try {
  const results = [];
  for (const demo of DEMOS) {
    results.push(await seedDemo(demo));
  }

  payload.logger.info("Demo data is ready (running this command again safely refreshes it).\n");
  for (const result of results) {
    payload.logger.info(`${result.organization}: ${result.floorCount} floors, ${result.buildingId}`);
    payload.logger.info(`  Email: ${result.email}`);
    payload.logger.info(`  Password: ${DEMO_PASSWORD}`);
  }
} finally {
  await payload.destroy();
}
