-- Armenia Water Atlas
-- Natural lakes: coordinate update — batch 02
-- Only latitude/longitude are updated. Existing geometry and metadata are preserved.

BEGIN;

UPDATE water_objects
SET latitude = 40.226000, longitude = 44.947000
WHERE type = 'lake' AND name_hy = 'Աժդահակի խառնարանային լիճ';

UPDATE water_objects
SET latitude = 40.542960, longitude = 44.208770
WHERE type = 'lake' AND name_hy = 'Աստղկան լիճ';

UPDATE water_objects
SET latitude = 40.531100, longitude = 44.182200
WHERE type = 'lake' AND name_hy = 'Մթնալիճ';

UPDATE water_objects
SET latitude = 40.520100, longitude = 44.262900
WHERE type = 'lake' AND name_hy = 'Ումրոյ լիճ';

UPDATE water_objects
SET latitude = 40.525556, longitude = 44.235556
WHERE type = 'lake' AND name_hy = 'Լեսինգի լիճ';

UPDATE water_objects
SET latitude = 40.068110, longitude = 45.215270
WHERE type = 'lake' AND name_hy = 'Արմաղանի լիճ';

COMMIT;

-- Verification
SELECT
  id,
  name_hy,
  latitude,
  longitude,
  CASE
    WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 'OK'
    ELSE 'MISSING'
  END AS coordinate_status
FROM water_objects
WHERE type = 'lake'
  AND name_hy IN (
    'Աժդահակի խառնարանային լիճ',
    'Աստղկան լիճ',
    'Մթնալիճ',
    'Ումրոյ լիճ',
    'Լեսինգի լիճ',
    'Արմաղանի լիճ'
  )
ORDER BY name_hy;
