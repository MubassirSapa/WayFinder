export type LandingFloor = {
  id: string;
  name: string;
  level: number;
  href: string;
};

export type LandingVenue = {
  id: string;
  name: string;
  backgroundImageUrl: string | null;
  addedAt: string;
  href: string;
  floors: LandingFloor[];
};

export type PublicLandingData = {
  venues: LandingVenue[];
  isAvailable: boolean;
};
