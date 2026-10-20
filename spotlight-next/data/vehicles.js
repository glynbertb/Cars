// Spec sheet for the 7 hero machines. Values are manufacturer-claim style figures.
export const SPECS = {
  "01": { hp: 807, zero: 3.4, speed: 327, kg: 2018 },
  "02": { hp: 212, zero: 3.1, speed: 306, kg: 193 },
  "03": { hp: 1800, zero: 2.0, speed: 445, kg: 1995 },
  "04": { hp: 218, zero: 3.0, speed: 305, kg: 186 },
  "05": { hp: 217, zero: 3.2, speed: 305, kg: 202 },
  "06": { hp: 200, zero: 3.2, speed: 299, kg: 202 },
  "07": { hp: 518, zero: 3.2, speed: 296, kg: 1450 },
};

export function withSpecs(items) {
  return items.map((it) => ({ ...it, ...(SPECS[it.id] || {}) }));
}
