export type LandingFloor = {
  id: string;
  name: string;
  level: number;
  href: string;
};

export type LandingVenue = {
  id: string;
  name: string;
  address: string | null;
  backgroundImageUrl: string | null;
  logoUrl: string | null;
  organizationId: string;
  organizationName: string;
  organizationLogoUrl: string | null;
  addedAt: string;
  href: string;
  floors: LandingFloor[];
};

export type LandingOrganization = {
  id: string;
  name: string;
  logoUrl: string | null;
  venueCount: number;
};

export type PublicLandingData = {
  venues: LandingVenue[];
  isAvailable: boolean;
};
