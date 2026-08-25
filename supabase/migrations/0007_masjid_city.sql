-- Noor: city/district on masjids, for the "pick your masjid" onboarding flow
-- (select a district -> only masjids in that district are offered).

alter table masjids add column if not exists city text;

create index if not exists masjids_city on masjids (city);

comment on column masjids.city is
  'District/city name, free text (e.g. "Kathmandu", "Bhairahawa"). Used to filter the masjid picker.';
