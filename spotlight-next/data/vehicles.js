// Canonical machine catalogue for the 7 hero machines.
//
// Adding a new machine only needs ONE new entry in VEHICLES below.
// Shape per entry:
//   id, slug, name, brand, year, type ("car" | "bike"),
//   class, rating, modelPath (.glb, "" = procedural fallback),
//   posterImage, description,
//   specs: { powerHp, zeroTo100Sec, topSpeedKmh, weightKg },
//   accents: [warmGlow, coolGlow]  (arch ring gradient, left -> right),
//   paintOptions: [{ name, hex }],
//   hotspots: [{ id, label, detail }] (optional)
//
// Spec figures are well-known manufacturer-claim style figures. Values flagged
// with "est." are interpolations where the maker publishes no exact number.

// ---------------------------------------------------------------------------
// Real-world spec figures (maker-claimed, top trim implied by the catalogue)
// ---------------------------------------------------------------------------
export const VEHICLES = [
  {
    id: "01",
    slug: "dodge-challenger",
    name: "Dodge Challenger",
    brand: "Dodge",
    year: 2023, // last model year of the LD Challenger (Hellcat Redeye trim)
    type: "car",
    class: "Muscle car",
    rating: 9.4,
    modelPath: "/models/dodge.glb",
    posterImage: "/images/dodge.jpg",
    description:
      "Supercharged 6.2L HEMI V8 muscle coupe — the SRT Hellcat Redeye Widebody, the loudest farewell of the HEMI era.",
    specs: { powerHp: 797, zeroTo100Sec: 3.4, topSpeedKmh: 327, weightKg: 2018 },
    accents: ["#ff3b30", "#35c4ff"],
    paintOptions: [
      { name: "Go Mango", hex: "#e8590c" },
      { name: "TorRed", hex: "#d62828" },
      { name: "Pitch Black", hex: "#14161a" },
      { name: "Billet Silver", hex: "#c8cdd6" },
      { name: "Plum Crazy", hex: "#6c2bd9" },
    ],
    hotspots: [
      { id: "engine", label: "Supercharged 6.2L HEMI V8", detail: "797 hp, 959 Nm, twin-screw supercharger." },
      { id: "drive", label: "Rear-wheel drive", detail: "8-speed TorqueFlite automatic, launch control." },
    ],
  },
  {
    id: "02",
    slug: "bmw-m-1000-rr",
    name: "BMW M 1000 RR",
    brand: "BMW",
    year: 2025,
    type: "bike",
    class: "Superbike",
    rating: 9.2,
    modelPath: "",
    posterImage: "/images/BMW.jpg",
    description:
      "BMW M's 999 cc ShiftCam inline-four superbike with M winglets and M chassis — built for the podium.",
    specs: { powerHp: 212, zeroTo100Sec: 3.1, topSpeedKmh: 306, weightKg: 193 },
    accents: ["#ff4343", "#3aa0ff"],
    paintOptions: [
      { name: "M Light White", hex: "#eef1f6" },
      { name: "M Racing Blue", hex: "#1f5eff" },
      { name: "M Racing Red", hex: "#e10600" },
      { name: "Blackstorm", hex: "#15171c" },
    ],
    hotspots: [
      { id: "engine", label: "999 cc ShiftCam inline-four", detail: "212 hp @ 14,500 rpm." },
      { id: "aero", label: "M winglets", detail: "Carbon aero package, slide control." },
    ],
  },
  {
    id: "03",
    slug: "bugatti-tourbillon",
    name: "Bugatti Tourbillon",
    brand: "Bugatti",
    year: 2026, // customer deliveries begin 2026
    type: "car",
    class: "Hypercar",
    rating: 9.6,
    modelPath: "",
    posterImage: "/images/bugatti.jpg",
    description:
      "Bugatti's V16 hybrid flagship — a naturally aspirated 8.3L V16 plus three e-motors, wrapped in a mechanical-watch cabin.",
    specs: { powerHp: 1800, zeroTo100Sec: 2.0, topSpeedKmh: 445, weightKg: 1995 },
    accents: ["#ff2e4d", "#38b6ff"],
    paintOptions: [
      { name: "Nocturne", hex: "#101216" },
      { name: "Atlantic Blue", hex: "#1f5eff" },
      { name: "Argent", hex: "#c8ccd4" },
      { name: "Italian Red", hex: "#c40000" },
    ],
    hotspots: [
      { id: "engine", label: "8.3L V16 hybrid", detail: "1,800 hp system output, 9,000 rpm redline." },
      { id: "cabin", label: "Horology cabin", detail: "Titanium instrument cluster built by watchmakers." },
    ],
  },
  {
    id: "04",
    slug: "ducati-panigale-v4-r",
    name: "Ducati Panigale V4 R",
    brand: "Ducati",
    year: 2025,
    type: "bike",
    class: "Superbike",
    rating: 9.4,
    modelPath: "",
    posterImage: "/images/ducati.jpg",
    description:
      "Ducati's homologation-special Desmosedici Stradale R V4 — the closest thing to a MotoGP bike with plates.",
    specs: { powerHp: 218, zeroTo100Sec: 3.1, topSpeedKmh: 299, weightKg: 172 }, // 0-100 est.; top speed est. (gearing/track dependent); weight dry
    accents: ["#ff1e2d", "#7ab8ff"],
    paintOptions: [
      { name: "Ducati Red", hex: "#d62828" },
      { name: "Corse Livery", hex: "#b3122b" },
      { name: "Winter Test", hex: "#e8edf5" },
      { name: "Stealth Black", hex: "#17191d" },
    ],
    hotspots: [
      { id: "engine", label: "998 cc Desmosedici Stradale R V4", detail: "218 hp @ 15,500 rpm." },
      { id: "aero", label: "Biplane wings", detail: "MotoGP-derived downforce package." },
    ],
  },
  {
    id: "05",
    slug: "aprilia-rsv4-factory",
    name: "Aprilia RSV4 Factory",
    brand: "Aprilia",
    year: 2025,
    type: "bike",
    class: "Superbike",
    rating: 9.3,
    modelPath: "",
    posterImage: "/images/aprilia.jpg",
    description:
      "Aprilia's 65-degree 1099 cc V4 flagship with Öhlins Smart EC 2.0 semi-active suspension and aero winglets.",
    specs: { powerHp: 217, zeroTo100Sec: 3.2, topSpeedKmh: 305, weightKg: 202 }, // 0-100 est.; top speed est.
    accents: ["#ff2e63", "#7b5cff"],
    paintOptions: [
      { name: "Aprilia Black", hex: "#17191d" },
      { name: "A Racing Red", hex: "#d5001c" },
      { name: "Time Attack", hex: "#3a3f4a" },
    ],
    hotspots: [
      { id: "engine", label: "1099 cc 65° V4", detail: "217 hp @ 13,000 rpm." },
      { id: "suspension", label: "Öhlins Smart EC 2.0", detail: "Semi-active suspension, forged wheels." },
    ],
  },
  {
    id: "06",
    slug: "yamaha-yzf-r1m",
    name: "Yamaha YZF-R1M",
    brand: "Yamaha",
    year: 2025,
    type: "bike",
    class: "Superbike",
    rating: 9.2,
    modelPath: "/models/yamaha.glb",
    posterImage: "/images/yamaha.jpg",
    description:
      "Yamaha's crossplane-crank 998 cc superbike with carbon bodywork, electronic racing suspension and slide control.",
    specs: { powerHp: 200, zeroTo100Sec: 3.2, topSpeedKmh: 299, weightKg: 202 }, // 0-100 est.
    accents: ["#ff4d4d", "#2e7bff"],
    paintOptions: [
      { name: "Racing Blue", hex: "#1f5eff" },
      { name: "Tech Black", hex: "#15171c" },
      { name: "Silver", hex: "#c8cdd6" },
    ],
    hotspots: [
      { id: "engine", label: "998 cc crossplane inline-four", detail: "200 hp, magnesium wheels." },
      { id: "suspension", label: "ERS Öhlins", detail: "Electronic Racing Suspension, CCU data logger." },
    ],
  },
  {
    id: "07",
    slug: "porsche-911-gt3-rs-992",
    name: "Porsche 911 GT3 RS",
    brand: "Porsche",
    year: 2025, // 992-generation GT3 RS
    type: "car",
    class: "Track car",
    rating: 9.5,
    modelPath: "/models/porche.glb",
    posterImage: "/images/porche.jpg",
    description:
      "The 992 GT3 RS — a 9,000 rpm naturally aspirated flat-six with DRS drag reduction and 860 kg of downforce.",
    specs: { powerHp: 518, zeroTo100Sec: 3.2, topSpeedKmh: 296, weightKg: 1450 },
    accents: ["#ff3b30", "#30b0ff"],
    paintOptions: [
      { name: "GT Silver", hex: "#c8ccd4" },
      { name: "Shark Blue", hex: "#1f9bff" },
      { name: "Guards Red", hex: "#d5001c" },
      { name: "Black", hex: "#101216" },
      { name: "White", hex: "#f2f2f2" },
    ],
    hotspots: [
      { id: "engine", label: "4.0L flat-six", detail: "518 hp @ 8,500 rpm, 9,000 rpm redline." },
      { id: "aero", label: "DRS rear wing", detail: "Formula-1 style drag reduction, 860 kg downforce." },
    ],
  },
];

// Lookups
export const VEHICLE_BY_ID = Object.fromEntries(VEHICLES.map((v) => [v.id, v]));
export const VEHICLE_BY_SLUG = Object.fromEntries(VEHICLES.map((v) => [v.slug, v]));

// Best-in-class values across all machines (gauge arcs are proportional to these)
export const BEST = {
  powerHp: Math.max(...VEHICLES.map((v) => v.specs.powerHp)),
  zeroTo100Sec: Math.min(...VEHICLES.map((v) => v.specs.zeroTo100Sec)),
  topSpeedKmh: Math.max(...VEHICLES.map((v) => v.specs.topSpeedKmh)),
  weightKg: Math.min(...VEHICLES.map((v) => v.specs.weightKg)),
};

// Backwards-compatible spec sheet for the Gallery/Garage sections.
// (Kept so existing imports keep working; values mirror VEHICLES above.)
export const SPECS = Object.fromEntries(
  VEHICLES.map((v) => [
    v.id,
    { hp: v.specs.powerHp, zero: v.specs.zeroTo100Sec, speed: v.specs.topSpeedKmh, kg: v.specs.weightKg },
  ])
);

export function withSpecs(items) {
  return items.map((it) => ({ ...it, ...(SPECS[it.id] || {}) }));
}
