export type LandingVenue = {
  id: string;
  name: string;
  floorCount: number;
  searchableCount: number;
  accessibleCount: number;
  primaryFloorName: string;
  backgroundImageUrl: string | null;
  updatedAt: string;
};

export type LandingDestination = {
  id: string;
  name: string;
  type: string;
  venueName: string;
  floorName: string;
  isAccessible: boolean;
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
