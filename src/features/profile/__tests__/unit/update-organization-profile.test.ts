import { describe, expect, it } from "vitest";

import { UpdateOrganizationProfileSchema } from "../../validations/update-organization-profile";

const validProfile = {
  name: "Toronto General Hospital",
  type: "hospital" as const,
  email: "visitors@example.com",
  phone: "+1 416 555 0123",
  website: "example.com/visit",
  addressLine1: "200 Elizabeth Street",
  addressLine2: "Main entrance",
  city: "Toronto",
  region: "Ontario",
  postalCode: "M5G 2C4",
  country: "Canada",
};

describe("UpdateOrganizationProfileSchema", () => {
  it("trims values and adds a secure protocol to a website", () => {
    const result = UpdateOrganizationProfileSchema.parse({
      ...validProfile,
      name: "  Toronto General Hospital  ",
      website: "example.com/visit",
    });

    expect(result.name).toBe("Toronto General Hospital");
    expect(result.website).toBe("https://example.com/visit");
  });

  it("clears empty optional profile fields", () => {
    const result = UpdateOrganizationProfileSchema.parse({
      ...validProfile,
      email: "",
      phone: "   ",
      website: "",
      addressLine2: "",
    });

    expect(result.email).toBeNull();
    expect(result.phone).toBeNull();
    expect(result.website).toBeNull();
    expect(result.addressLine2).toBeNull();
  });

  it("rejects invalid public contact details", () => {
    expect(
      UpdateOrganizationProfileSchema.safeParse({
        ...validProfile,
        email: "not-an-email",
      }).success,
    ).toBe(false);

    expect(
      UpdateOrganizationProfileSchema.safeParse({
        ...validProfile,
        website: "not a website",
      }).success,
    ).toBe(false);
  });
});
