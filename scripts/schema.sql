


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE OR REPLACE FUNCTION "public"."get_reviewed_addresses"("p_south" double precision, "p_north" double precision, "p_west" double precision, "p_east" double precision, "p_min_reviews" integer DEFAULT 1) RETURNS TABLE("address_point_id" integer, "address" "text", "streetname" "text", "latitude" double precision, "longitude" double precision, "average_rating" numeric, "review_count" bigint)
    LANGUAGE "sql" STABLE
    AS $$
  SELECT
    ap.id AS address_point_id,
    ap.address,
    ap.streetname,
    ap.latitude::FLOAT,
    ap.longitude::FLOAT,
    ROUND(AVG(r.rating), 2) AS average_rating,
    COUNT(r.id) AS review_count
  FROM address_points ap
  JOIN reviews r ON r.address_point_id = ap.id
  WHERE ap.latitude BETWEEN p_south AND p_north
    AND ap.longitude BETWEEN p_west AND p_east
  GROUP BY ap.id, ap.address, ap.streetname, ap.latitude, ap.longitude
  HAVING COUNT(r.id) >= p_min_reviews;
$$;


ALTER FUNCTION "public"."get_reviewed_addresses"("p_south" double precision, "p_north" double precision, "p_west" double precision, "p_east" double precision, "p_min_reviews" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', 'Anonymous'));
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."address_points" (
    "id" bigint NOT NULL,
    "address" "text" NOT NULL,
    "prefix" "text",
    "pretype" "text",
    "name" "text" NOT NULL,
    "sttype" "text",
    "suffix" "text",
    "unit" "text",
    "streetname" "text" NOT NULL,
    "pa" integer,
    "code" "text" NOT NULL,
    "status" integer NOT NULL,
    "res" "text" NOT NULL,
    "mun" "text" NOT NULL,
    "longitude" double precision NOT NULL,
    "latitude" double precision NOT NULL,
    "images" "text"
);


ALTER TABLE "public"."address_points" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."community_neighborhoods" (
    "id" integer NOT NULL,
    "geo_id" "text" NOT NULL,
    "legacy_id" "text",
    "name" "text" NOT NULL,
    "area_sqmi" double precision,
    "center_lat" double precision,
    "center_lng" double precision,
    "boundary" "jsonb" NOT NULL,
    "image_url" "text",
    "description" "text",
    "city" "text",
    "state" "text",
    "rating" double precision,
    "review_count" integer
);


ALTER TABLE "public"."community_neighborhoods" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."community_neighborhoods_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."community_neighborhoods_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."community_neighborhoods_id_seq" OWNED BY "public"."community_neighborhoods"."id";



CREATE TABLE IF NOT EXISTS "public"."homes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "address_line1" "text" NOT NULL,
    "city" "text" NOT NULL,
    "state" character(2) NOT NULL,
    "zip" "text" NOT NULL,
    "property_type" "text",
    "living_area" integer,
    "beds" integer,
    "baths" numeric(3,1),
    "levels" integer,
    "last_sale_price" numeric(12,2),
    "last_sale_date" "date",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "image_url" "text",
    "rating" double precision,
    "review_count" integer,
    "latitude" double precision,
    "longitude" double precision
);


ALTER TABLE "public"."homes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."livability_regions" (
    "id" integer NOT NULL,
    "geoid" "text" NOT NULL,
    "score" integer NOT NULL,
    "score_engage" double precision,
    "score_env" double precision,
    "score_health" double precision,
    "score_house" double precision,
    "score_opp" double precision,
    "score_prox" double precision,
    "score_trans" double precision,
    "metrics" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "policies" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "demographics" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "climate" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "disaster_natural_hazard_risk" integer,
    "employ_unemp_rate" double precision,
    "geometry" "jsonb" NOT NULL
);


ALTER TABLE "public"."livability_regions" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."livability_regions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."livability_regions_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."livability_regions_id_seq" OWNED BY "public"."livability_regions"."id";



CREATE TABLE IF NOT EXISTS "public"."neighborhoods" (
    "id" integer NOT NULL,
    "name" "text" NOT NULL,
    "pa_number" integer NOT NULL,
    "geometry" "jsonb" NOT NULL
);


ALTER TABLE "public"."neighborhoods" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."neighborhoods_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."neighborhoods_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."neighborhoods_id_seq" OWNED BY "public"."neighborhoods"."id";



CREATE TABLE IF NOT EXISTS "public"."parks" (
    "id" integer NOT NULL,
    "name" "text" NOT NULL,
    "address" "text",
    "pa" integer,
    "amenities" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "acres" double precision,
    "wifi" boolean DEFAULT false NOT NULL,
    "facility_rental" boolean DEFAULT false NOT NULL,
    "rental_url" "text",
    "park_url" "text",
    "geometry" "jsonb" NOT NULL
);


ALTER TABLE "public"."parks" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."parks_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."parks_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."parks_id_seq" OWNED BY "public"."parks"."id";



CREATE TABLE IF NOT EXISTS "public"."pois" (
    "id" integer NOT NULL,
    "pid" integer NOT NULL,
    "attom_id" "text",
    "name" "text" NOT NULL,
    "address" "text",
    "city" "text",
    "state" "text",
    "zip_code" "text",
    "category" "text" NOT NULL,
    "line_of_business" "text",
    "industry" "text",
    "condensed_heading" "text",
    "phone" "text",
    "website" "text",
    "sic_code" "text"
);


ALTER TABLE "public"."pois" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."pois_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."pois_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."pois_id_seq" OWNED BY "public"."pois"."id";



CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "display_name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "saved" "jsonb"[],
    "saved_homes" "jsonb" DEFAULT '[]'::"jsonb"
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


COMMENT ON COLUMN "public"."profiles"."saved" IS 'saved neighborhoods per user';



CREATE TABLE IF NOT EXISTS "public"."review_likes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "review_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."review_likes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reviews" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "address_point_id" integer NOT NULL,
    "rating" smallint NOT NULL,
    "title" "text",
    "comment" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "reviews_rating_check" CHECK ((("rating" >= 1) AND ("rating" <= 5)))
);


ALTER TABLE "public"."reviews" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."school_districts" (
    "id" integer NOT NULL,
    "geo_id" "text" NOT NULL,
    "legacy_id" "text",
    "name" "text" NOT NULL,
    "center_lat" double precision,
    "center_lng" double precision,
    "boundary" "jsonb" NOT NULL
);


ALTER TABLE "public"."school_districts" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."school_districts_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."school_districts_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."school_districts_id_seq" OWNED BY "public"."school_districts"."id";



CREATE TABLE IF NOT EXISTS "public"."schools" (
    "id" integer NOT NULL,
    "geo_id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "address" "text",
    "city" "text",
    "state" "text",
    "zip_code" "text",
    "latitude" double precision NOT NULL,
    "longitude" double precision NOT NULL,
    "phone" "text",
    "school_url" "text",
    "institution_type" "text",
    "school_type" "text",
    "instructional_level" "text",
    "grade_span_low" "text",
    "grade_span_high" "text",
    "rating" "text",
    "district_name" "text"
);


ALTER TABLE "public"."schools" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."schools_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."schools_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."schools_id_seq" OWNED BY "public"."schools"."id";



ALTER TABLE ONLY "public"."community_neighborhoods" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."community_neighborhoods_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."livability_regions" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."livability_regions_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."neighborhoods" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."neighborhoods_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."parks" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."parks_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."pois" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."pois_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."school_districts" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."school_districts_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."schools" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."schools_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."address_points"
    ADD CONSTRAINT "address_points_images_key" UNIQUE ("images");



ALTER TABLE ONLY "public"."address_points"
    ADD CONSTRAINT "address_points_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."community_neighborhoods"
    ADD CONSTRAINT "community_neighborhoods_geo_id_key" UNIQUE ("geo_id");



ALTER TABLE ONLY "public"."community_neighborhoods"
    ADD CONSTRAINT "community_neighborhoods_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."homes"
    ADD CONSTRAINT "homes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."livability_regions"
    ADD CONSTRAINT "livability_regions_geoid_key" UNIQUE ("geoid");



ALTER TABLE ONLY "public"."livability_regions"
    ADD CONSTRAINT "livability_regions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."neighborhoods"
    ADD CONSTRAINT "neighborhoods_pa_number_key" UNIQUE ("pa_number");



ALTER TABLE ONLY "public"."neighborhoods"
    ADD CONSTRAINT "neighborhoods_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."parks"
    ADD CONSTRAINT "parks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pois"
    ADD CONSTRAINT "pois_pid_key" UNIQUE ("pid");



ALTER TABLE ONLY "public"."pois"
    ADD CONSTRAINT "pois_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_saved_key" UNIQUE ("saved");



ALTER TABLE ONLY "public"."review_likes"
    ADD CONSTRAINT "review_likes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."school_districts"
    ADD CONSTRAINT "school_districts_geo_id_key" UNIQUE ("geo_id");



ALTER TABLE ONLY "public"."school_districts"
    ADD CONSTRAINT "school_districts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."schools"
    ADD CONSTRAINT "schools_geo_id_key" UNIQUE ("geo_id");



ALTER TABLE ONLY "public"."schools"
    ADD CONSTRAINT "schools_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_address_points_lat" ON "public"."address_points" USING "btree" ("latitude");



CREATE INDEX "idx_address_points_lng" ON "public"."address_points" USING "btree" ("longitude");



CREATE INDEX "idx_community_neighborhoods_geo_id" ON "public"."community_neighborhoods" USING "btree" ("geo_id");



CREATE INDEX "idx_community_neighborhoods_name" ON "public"."community_neighborhoods" USING "btree" ("name");



CREATE INDEX "idx_livability_regions_geoid" ON "public"."livability_regions" USING "btree" ("geoid");



CREATE INDEX "idx_livability_regions_score" ON "public"."livability_regions" USING "btree" ("score");



CREATE INDEX "idx_neighborhoods_pa_number" ON "public"."neighborhoods" USING "btree" ("pa_number");



CREATE INDEX "idx_parks_pa" ON "public"."parks" USING "btree" ("pa");



CREATE INDEX "idx_pois_category" ON "public"."pois" USING "btree" ("category");



CREATE INDEX "idx_pois_pid" ON "public"."pois" USING "btree" ("pid");



CREATE INDEX "idx_pois_zip_code" ON "public"."pois" USING "btree" ("zip_code");



CREATE INDEX "idx_profiles_display_name" ON "public"."profiles" USING "btree" ("display_name");



CREATE INDEX "idx_profiles_saved" ON "public"."profiles" USING "gin" ("saved");



CREATE INDEX "idx_review_likes_review_id" ON "public"."review_likes" USING "btree" ("review_id");



CREATE UNIQUE INDEX "idx_review_likes_user_review" ON "public"."review_likes" USING "btree" ("user_id", "review_id");



CREATE INDEX "idx_reviews_address_point_id" ON "public"."reviews" USING "btree" ("address_point_id");



CREATE INDEX "idx_reviews_created_at" ON "public"."reviews" USING "btree" ("created_at" DESC);



CREATE UNIQUE INDEX "idx_reviews_user_address" ON "public"."reviews" USING "btree" ("user_id", "address_point_id");



CREATE INDEX "idx_reviews_user_id" ON "public"."reviews" USING "btree" ("user_id");



CREATE INDEX "idx_school_districts_geo_id" ON "public"."school_districts" USING "btree" ("geo_id");



CREATE INDEX "idx_schools_geo_id" ON "public"."schools" USING "btree" ("geo_id");



CREATE INDEX "idx_schools_lat" ON "public"."schools" USING "btree" ("latitude");



CREATE INDEX "idx_schools_lng" ON "public"."schools" USING "btree" ("longitude");



ALTER TABLE ONLY "public"."parks"
    ADD CONSTRAINT "parks_pa_fkey" FOREIGN KEY ("pa") REFERENCES "public"."neighborhoods"("pa_number");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."review_likes"
    ADD CONSTRAINT "review_likes_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "public"."reviews"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."review_likes"
    ADD CONSTRAINT "review_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_address_point_id_fkey" FOREIGN KEY ("address_point_id") REFERENCES "public"."address_points"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Allow public read access" ON "public"."address_points" FOR SELECT USING (true);



CREATE POLICY "Allow public read access" ON "public"."community_neighborhoods" FOR SELECT USING (true);



CREATE POLICY "Allow public read access" ON "public"."livability_regions" FOR SELECT USING (true);



CREATE POLICY "Allow public read access" ON "public"."neighborhoods" FOR SELECT USING (true);



CREATE POLICY "Allow public read access" ON "public"."parks" FOR SELECT USING (true);



CREATE POLICY "Allow public read access" ON "public"."pois" FOR SELECT USING (true);



CREATE POLICY "Allow public read access" ON "public"."school_districts" FOR SELECT USING (true);



CREATE POLICY "Allow public read access" ON "public"."schools" FOR SELECT USING (true);



CREATE POLICY "Profiles are viewable by everyone" ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "Review likes are viewable by everyone" ON "public"."review_likes" FOR SELECT USING (true);



CREATE POLICY "Reviews are viewable by everyone" ON "public"."reviews" FOR SELECT USING (true);



CREATE POLICY "Users can create their own reviews" ON "public"."reviews" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own reviews" ON "public"."reviews" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can like reviews" ON "public"."review_likes" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can unlike reviews" ON "public"."review_likes" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can update their own reviews" ON "public"."reviews" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."address_points" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."community_neighborhoods" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."homes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."livability_regions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."neighborhoods" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."parks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."pois" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."review_likes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reviews" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."school_districts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."schools" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."get_reviewed_addresses"("p_south" double precision, "p_north" double precision, "p_west" double precision, "p_east" double precision, "p_min_reviews" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_reviewed_addresses"("p_south" double precision, "p_north" double precision, "p_west" double precision, "p_east" double precision, "p_min_reviews" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_reviewed_addresses"("p_south" double precision, "p_north" double precision, "p_west" double precision, "p_east" double precision, "p_min_reviews" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON TABLE "public"."address_points" TO "anon";
GRANT ALL ON TABLE "public"."address_points" TO "authenticated";
GRANT ALL ON TABLE "public"."address_points" TO "service_role";



GRANT ALL ON TABLE "public"."community_neighborhoods" TO "anon";
GRANT ALL ON TABLE "public"."community_neighborhoods" TO "authenticated";
GRANT ALL ON TABLE "public"."community_neighborhoods" TO "service_role";



GRANT ALL ON SEQUENCE "public"."community_neighborhoods_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."community_neighborhoods_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."community_neighborhoods_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."homes" TO "anon";
GRANT ALL ON TABLE "public"."homes" TO "authenticated";
GRANT ALL ON TABLE "public"."homes" TO "service_role";



GRANT ALL ON TABLE "public"."livability_regions" TO "anon";
GRANT ALL ON TABLE "public"."livability_regions" TO "authenticated";
GRANT ALL ON TABLE "public"."livability_regions" TO "service_role";



GRANT ALL ON SEQUENCE "public"."livability_regions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."livability_regions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."livability_regions_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."neighborhoods" TO "anon";
GRANT ALL ON TABLE "public"."neighborhoods" TO "authenticated";
GRANT ALL ON TABLE "public"."neighborhoods" TO "service_role";



GRANT ALL ON SEQUENCE "public"."neighborhoods_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."neighborhoods_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."neighborhoods_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."parks" TO "anon";
GRANT ALL ON TABLE "public"."parks" TO "authenticated";
GRANT ALL ON TABLE "public"."parks" TO "service_role";



GRANT ALL ON SEQUENCE "public"."parks_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."parks_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."parks_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."pois" TO "anon";
GRANT ALL ON TABLE "public"."pois" TO "authenticated";
GRANT ALL ON TABLE "public"."pois" TO "service_role";



GRANT ALL ON SEQUENCE "public"."pois_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."pois_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."pois_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."review_likes" TO "anon";
GRANT ALL ON TABLE "public"."review_likes" TO "authenticated";
GRANT ALL ON TABLE "public"."review_likes" TO "service_role";



GRANT ALL ON TABLE "public"."reviews" TO "anon";
GRANT ALL ON TABLE "public"."reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."reviews" TO "service_role";



GRANT ALL ON TABLE "public"."school_districts" TO "anon";
GRANT ALL ON TABLE "public"."school_districts" TO "authenticated";
GRANT ALL ON TABLE "public"."school_districts" TO "service_role";



GRANT ALL ON SEQUENCE "public"."school_districts_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."school_districts_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."school_districts_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."schools" TO "anon";
GRANT ALL ON TABLE "public"."schools" TO "authenticated";
GRANT ALL ON TABLE "public"."schools" TO "service_role";



GRANT ALL ON SEQUENCE "public"."schools_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."schools_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."schools_id_seq" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";







