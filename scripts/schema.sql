CREATE TABLE address_points (
  id BIGINT PRIMARY KEY,
  address TEXT NOT NULL,
  prefix TEXT,
  pretype TEXT,
  name TEXT NOT NULL,
  sttype TEXT,
  suffix TEXT,
  unit TEXT,
  streetname TEXT NOT NULL,
  pa INTEGER NOT NULL,
  code TEXT NOT NULL,
  status INTEGER NOT NULL,
  res TEXT NOT NULL,
  mun TEXT NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  latitude DOUBLE PRECISION NOT NULL
);

ALTER TABLE address_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON address_points
  FOR SELECT USING (true);

CREATE INDEX idx_address_points_lat ON address_points (latitude);
CREATE INDEX idx_address_points_lng ON address_points (longitude);
