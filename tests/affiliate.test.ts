import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  commissionCents,
  bonusEurosForRevenue,
  nextTier,
  COMMISSION_RATE,
} from "../lib/affiliate";

describe("commission d'affiliation", () => {
  test("80% du 1er paiement, arrondi au centime", () => {
    assert.equal(COMMISSION_RATE, 0.8);
    assert.equal(commissionCents(899), 719); // 8,99€ → 7,19€
    assert.equal(commissionCents(5900), 4720); // 59€ → 47,20€
    assert.equal(commissionCents(0), 0);
  });
});

describe("bonus de paliers cumulatifs", () => {
  test("rien en dessous de 500€ de CA", () => {
    assert.equal(bonusEurosForRevenue(0), 0);
    assert.equal(bonusEurosForRevenue(49900), 0); // 499€
  });

  test("+50€ dès 500€ de CA", () => {
    assert.equal(bonusEurosForRevenue(50000), 50); // pile 500€
    assert.equal(bonusEurosForRevenue(99900), 50); // 999€
  });

  test("+150€ (cumulatif) dès 1000€ de CA", () => {
    assert.equal(bonusEurosForRevenue(100000), 150); // pile 1000€ → 50 + 100
    assert.equal(bonusEurosForRevenue(250000), 150); // 2500€ : pas de palier au-dessus pour l'instant
  });
});

describe("prochain palier (jauge de motivation)", () => {
  test("pointe vers 500€ au départ", () => {
    assert.deepEqual(nextTier(0), { thresholdEuros: 500, bonusEuros: 50 });
  });
  test("pointe vers 1000€ entre les deux", () => {
    assert.deepEqual(nextTier(60000), { thresholdEuros: 1000, bonusEuros: 100 });
  });
  test("null quand tout est débloqué", () => {
    assert.equal(nextTier(100000), null);
  });
});
