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
  pa INTEGER,
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

CREATE TABLE livability_regions (
  id SERIAL PRIMARY KEY,
  geoid TEXT NOT NULL UNIQUE,
  score INTEGER NOT NULL,
  score_engage DOUBLE PRECISION,
  score_env DOUBLE PRECISION,
  score_health DOUBLE PRECISION,
  score_house DOUBLE PRECISION,
  score_opp DOUBLE PRECISION,
  score_prox DOUBLE PRECISION,
  score_trans DOUBLE PRECISION,
  metrics JSONB NOT NULL DEFAULT '{}',
  policies JSONB NOT NULL DEFAULT '{}',
  demographics JSONB NOT NULL DEFAULT '{}',
  climate JSONB NOT NULL DEFAULT '{}',
  disaster_natural_hazard_risk INTEGER,
  employ_unemp_rate DOUBLE PRECISION,
  geometry JSONB NOT NULL
);

ALTER TABLE livability_regions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON livability_regions
  FOR SELECT USING (true);

CREATE INDEX idx_livability_regions_geoid ON livability_regions (geoid);
CREATE INDEX idx_livability_regions_score ON livability_regions (score);

CREATE TABLE neighborhoods (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  pa_number INTEGER NOT NULL UNIQUE,
  geometry JSONB NOT NULL
);

ALTER TABLE neighborhoods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON neighborhoods
  FOR SELECT USING (true);

CREATE INDEX idx_neighborhoods_pa_number ON neighborhoods (pa_number);

CREATE TABLE parks (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  pa INTEGER REFERENCES neighborhoods(pa_number),
  amenities JSONB NOT NULL DEFAULT '{}',
  acres DOUBLE PRECISION,
  wifi BOOLEAN NOT NULL DEFAULT false,
  facility_rental BOOLEAN NOT NULL DEFAULT false,
  rental_url TEXT,
  park_url TEXT,
  geometry JSONB NOT NULL
);

ALTER TABLE parks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON parks
  FOR SELECT USING (true);

CREATE INDEX idx_parks_pa ON parks (pa);

CREATE TABLE schools (
  id SERIAL PRIMARY KEY,
  geo_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  phone TEXT,
  school_url TEXT,
  institution_type TEXT,
  school_type TEXT,
  instructional_level TEXT,
  grade_span_low TEXT,
  grade_span_high TEXT,
  rating TEXT,
  district_name TEXT
);

ALTER TABLE schools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON schools
  FOR SELECT USING (true);

CREATE INDEX idx_schools_lat ON schools (latitude);
CREATE INDEX idx_schools_lng ON schools (longitude);
CREATE INDEX idx_schools_geo_id ON schools (geo_id);

CREATE TABLE school_districts (
  id SERIAL PRIMARY KEY,
  geo_id TEXT NOT NULL UNIQUE,
  legacy_id TEXT,
  name TEXT NOT NULL,
  center_lat DOUBLE PRECISION,
  center_lng DOUBLE PRECISION,
  boundary JSONB NOT NULL
);

ALTER TABLE school_districts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON school_districts
  FOR SELECT USING (true);

CREATE INDEX idx_school_districts_geo_id ON school_districts (geo_id);

CREATE TABLE community_neighborhoods (
  id SERIAL PRIMARY KEY,
  geo_id TEXT NOT NULL UNIQUE,
  legacy_id TEXT,
  name TEXT NOT NULL,
  area_sqmi DOUBLE PRECISION,
  center_lat DOUBLE PRECISION,
  center_lng DOUBLE PRECISION,
  boundary JSONB NOT NULL
);

ALTER TABLE community_neighborhoods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON community_neighborhoods
  FOR SELECT USING (true);

CREATE INDEX idx_community_neighborhoods_geo_id ON community_neighborhoods (geo_id);
CREATE INDEX idx_community_neighborhoods_name ON community_neighborhoods (name);

CREATE TABLE pois (
  id SERIAL PRIMARY KEY,
  pid INTEGER NOT NULL UNIQUE,
  attom_id TEXT,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  category TEXT NOT NULL,
  line_of_business TEXT,
  industry TEXT,
  condensed_heading TEXT,
  phone TEXT,
  website TEXT,
  sic_code TEXT
);

ALTER TABLE pois ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON pois
  FOR SELECT USING (true);

CREATE INDEX idx_pois_category ON pois (category);
CREATE INDEX idx_pois_zip_code ON pois (zip_code);
CREATE INDEX idx_pois_pid ON pois (pid);
