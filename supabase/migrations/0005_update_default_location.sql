-- Noor: the IQRA Tutorial Hub calendar is a single national schedule for Nepal,
-- not one specific city. Correct the seeded location accordingly.

update locations
set
  name = 'Nepal',
  country = 'Nepal',
  latitude = 27.7172,   -- Kathmandu, used as a representative center point (not GPS-critical: this is one nationwide schedule)
  longitude = 85.3240,
  timezone = 'Asia/Kathmandu',
  source = 'IQRA Tutorial Hub table calendar (nationwide Nepal prayer schedule)'
where id = '00000000-0000-0000-0000-000000000001';
