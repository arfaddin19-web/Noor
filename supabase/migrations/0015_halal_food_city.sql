-- Noor: city/district on halal_food_places, for consistency with the same
-- field on masjids (0007_masjid_city.sql) — lets the mobile app's Halal Food
-- screen offer the same "search by city" experience Masjids already has.

alter table halal_food_places add column if not exists city text;

create index if not exists halal_food_city on halal_food_places (city);

comment on column halal_food_places.city is
  'District/city name, free text (e.g. "Kathmandu", "Bhairahawa"). Used to search the halal food list.';
