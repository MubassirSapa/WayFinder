export type LandingFloor = {
  id: string;
  name: string;
  level: number;
  backgroundImageUrl: string | null;
  updatedAt: string;
  href: string;
};

export type LandingVenue = {
  id: string;
  name: string;
  floorCount: number;
  searchableCount: number;
  accessibleCount: number;
  primaryFloorName: string;
  backgroundImageUrl: string | null;
  updatedAt: string;
  floors: LandingFloor[];
};

export type LandingDestination = {
  id: string;
  name: string;
  type: string;
  venueName: string;
  floorName: string;
  isAccessible: boolean;
  href: string | null;
};

export type PublicLandingData = {
  venues: LandingVenue[];
  recentDestinations: LandingDestination[];
  stats: {
    venueCount: number;
    floorCount: number;
    destinationCount: number;
  };
  isAvailable: boolean;
};
