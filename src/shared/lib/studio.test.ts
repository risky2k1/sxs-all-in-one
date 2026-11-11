import { describe, expect, it } from "vitest";

import { assetUrl } from "@/shared/lib/assetUrl";
import { resonance } from "@/shared/lib/resonance";

describe("assetUrl", () => {
  it("uses the bundled image when nothing was uploaded", () => {
    expect(
      assetUrl(
        { storagePath: null, defaultPath: "/assets/eq_weapon.png" },
        "https://db.example",
      ),
    ).toBe("/assets/eq_weapon.png");
  });

  it("uses the public storage url after an upload", () => {
    expect(
      assetUrl(
        { storagePath: "eq_weapon.png", defaultPath: "/assets/eq_weapon.png" },
        "https://db.example",
      ),
    ).toBe(
      "https://db.example/storage/v1/object/public/game-assets/eq_weapon.png",
    );
  });
});

describe("resonance", () => {
  it("locks the milestone to the lowest piece, in steps of 5", () => {
    const result = resonance([38, 35, 35, 35, 35]);
    expect(result.current).toBe(35);
    expect(result.uneven).toBe(false);
  });

  it("warns when gear levels drift by more than 5", () => {
    expect(resonance([40, 30, 35, 35, 35]).uneven).toBe(true);
  });
});
