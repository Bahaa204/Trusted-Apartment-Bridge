import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://iiffmxgbjldpvtiamzhi.supabase.co",
  "sb_publishable_wttyycHKTunjw4P8de1W4A_FS0eGcuF"
);

async function seed() {
  console.log("Seeding database...");

  // 1. Insert countries (Egypt already exists with id=1)
  const { data: newCountries, error: cErr } = await supabase
    .from("countries")
    .upsert([
      { id: 1, name: "Egypt" },
      { id: 2, name: "United Arab Emirates" },
      { id: 3, name: "United Kingdom" },
    ], { onConflict: "id" })
    .select();

  if (cErr) {
    console.log("Countries insert error:", cErr.message);
    // Try insert only new ones
    const { error: c2 } = await supabase
      .from("countries")
      .insert([
        { id: 2, name: "United Arab Emirates" },
        { id: 3, name: "United Kingdom" },
      ]);
    if (c2) console.log("Countries fallback error:", c2.message);
    else console.log("Countries inserted (fallback)");
  } else {
    console.log("Countries upserted:", newCountries?.length);
  }

  // 2. Insert projects
  const projects = [
    { id: 1, name: "Pyramids Gate Residence", description: "A luxurious residential compound located near the Great Pyramids of Giza. Features modern apartments with stunning views of the ancient wonders, landscaped gardens, swimming pools, and a private clubhouse.", country_id: 1, location: "Giza, Cairo" },
    { id: 2, name: "Nile Tower", description: "A prestigious high-rise tower on the banks of the Nile River. Offering premium apartments and penthouses with panoramic river views, world-class amenities, and a rooftop infinity pool.", country_id: 1, location: "Zamalek, Cairo" },
    { id: 3, name: "Marina Bay Villas", description: "Exclusive waterfront villas in the heart of Dubai Marina. Each villa features private pools, smart home technology, and direct marina access. Walking distance to top restaurants and retail.", country_id: 2, location: "Dubai Marina, Dubai" },
    { id: 4, name: "Downtown Oasis", description: "A modern mixed-use development in Downtown Dubai featuring luxury apartments with views of the Burj Khalifa. Includes retail spaces, a fitness center, and a landscaped podium garden.", country_id: 2, location: "Downtown Dubai" },
    { id: 5, name: "Palm Residences", description: "Beachfront apartments on the iconic Palm Jumeirah. Resort-style living with private beach access, water sports facilities, and a luxury spa.", country_id: 2, location: "Palm Jumeirah, Dubai" },
    { id: 6, name: "Thames View Apartments", description: "Contemporary riverside apartments in central London with stunning views of the Thames. Features include a concierge service, gym, and beautifully landscaped communal gardens.", country_id: 3, location: "South Bank, London" },
    { id: 7, name: "Mayfair Heights", description: "An elegant residential development in the prestigious Mayfair district. Classic British architecture meets modern luxury with high-end finishes and a private residents' lounge.", country_id: 3, location: "Mayfair, London" },
    { id: 8, name: "New Capital Gardens", description: "A sprawling green community in Egypt's New Administrative Capital. Family-friendly with parks, schools, mosques, and a commercial strip. Affordable yet modern living.", country_id: 1, location: "New Administrative Capital" },
  ];

  const { data: pData, error: pErr } = await supabase
    .from("projects")
    .upsert(projects, { onConflict: "id" })
    .select();
  if (pErr) console.log("Projects error:", pErr.message);
  else console.log("Projects upserted:", pData?.length);

  // 3. Insert buildings
  const buildings = [
    { id: 1, name: "Block A", project_id: 1 },
    { id: 2, name: "Block B", project_id: 1 },
    { id: 3, name: "Tower 1", project_id: 2 },
    { id: 4, name: "Villa Cluster 1", project_id: 3 },
    { id: 5, name: "Villa Cluster 2", project_id: 3 },
    { id: 6, name: "Tower A", project_id: 4 },
    { id: 7, name: "Tower B", project_id: 4 },
    { id: 8, name: "Beachfront Block", project_id: 5 },
    { id: 9, name: "Riverside House", project_id: 6 },
    { id: 10, name: "Mayfair Wing", project_id: 7 },
    { id: 11, name: "Garden Block 1", project_id: 8 },
    { id: 12, name: "Garden Block 2", project_id: 8 },
  ];

  const { data: bData, error: bErr } = await supabase
    .from("buildings")
    .upsert(buildings, { onConflict: "id" })
    .select();
  if (bErr) console.log("Buildings error:", bErr.message);
  else console.log("Buildings upserted:", bData?.length);

  // 4. Insert houses
  const houses = [
    { id: 1, building_id: 1, price: 150000, floor: 1 },
    { id: 2, building_id: 1, price: 165000, floor: 2 },
    { id: 3, building_id: 1, price: 180000, floor: 3 },
    { id: 4, building_id: 2, price: 155000, floor: 1 },
    { id: 5, building_id: 2, price: 170000, floor: 2 },
    { id: 6, building_id: 3, price: 450000, floor: 5 },
    { id: 7, building_id: 3, price: 520000, floor: 10 },
    { id: 8, building_id: 3, price: 750000, floor: 20 },
    { id: 9, building_id: 4, price: 2500000, floor: 0 },
    { id: 10, building_id: 5, price: 3200000, floor: 0 },
    { id: 11, building_id: 6, price: 800000, floor: 8 },
    { id: 12, building_id: 6, price: 950000, floor: 15 },
    { id: 13, building_id: 7, price: 700000, floor: 3 },
    { id: 14, building_id: 8, price: 1800000, floor: 1 },
    { id: 15, building_id: 8, price: 2100000, floor: 5 },
    { id: 16, building_id: 9, price: 650000, floor: 2 },
    { id: 17, building_id: 9, price: 720000, floor: 6 },
    { id: 18, building_id: 10, price: 1200000, floor: 4 },
    { id: 19, building_id: 11, price: 95000, floor: 1 },
    { id: 20, building_id: 11, price: 110000, floor: 3 },
    { id: 21, building_id: 12, price: 100000, floor: 2 },
    { id: 22, building_id: 12, price: 120000, floor: 4 },
  ];

  const { data: hData, error: hErr } = await supabase
    .from("houses")
    .upsert(houses, { onConflict: "id" })
    .select();
  if (hErr) console.log("Houses error:", hErr.message);
  else console.log("Houses upserted:", hData?.length);

  console.log("Done!");
}

seed();
