const BASE = "https://api.api-ninjas.com/v1";
const title = (s) => String(s).replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
const slug = (...a) => a.join("-").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const HIDE = new Set(["make", "model", "year", "type"]);

async function call(kind, params) {
  const path = kind === "bike" ? "motorcycles" : "cars";
  const r = await fetch(`${BASE}/${path}?${new URLSearchParams(params)}`, {
    headers: { "X-Api-Key": process.env.API_NINJAS_KEY },
    next: { revalidate: 86400 },
  });
  if (!r.ok) throw new Error(`Upstream ${r.status}`);
  return r.json();
}

function normalize(kind, d) {
  const pick = (...k) => k.map((x) => d[x]).find(Boolean);
  const rows = Object.entries(d)
    .filter(([k, v]) => !HIDE.has(k) && v !== null && v !== "")
    .map(([k, v]) => [title(k), String(v)]);
  const stats = [
    ["Power", pick("power", "horsepower")], ["Torque", pick("torque")],
    ["Displacement", pick("displacement")], ["Weight", pick("dry_weight", "total_weight")],
    ["Cylinders", pick("cylinders")], ["Drive", pick("drive")],
    ["Fuel", pick("fuel_type")], ["Transmission", pick("transmission")],
  ].filter(([, v]) => v).slice(0, 4).map(([label, value]) => ({ label, value: String(value) }));
  return {
    id: slug(kind, d.make, d.model, d.year),
    type: kind, maker: title(d.make), name: title(d.model), year: d.year,
    stats, groups: [{ title: "Specifications", rows }],
  };
}

export async function search({ q, type }) {
  const kinds = type === "car" ? ["car"] : type === "bike" ? ["bike"] : ["car", "bike"];
  const jobs = kinds.flatMap((k) =>
    ["make", "model"].map((f) =>
      call(k, { [f]: q }).then((a) => a.map((d) => normalize(k, d))).catch(() => [])
    )
  );
  const seen = new Set();
  return (await Promise.all(jobs)).flat().filter((v) => !seen.has(v.id) && seen.add(v.id)).slice(0, 30);
}