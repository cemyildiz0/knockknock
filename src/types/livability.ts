import type { MultiPolygon } from "geojson";

export interface LivabilityMetrics {
  met_engage_broad: number;
  met_engage_civic: number;
  met_engage_culture: number;
  met_engage_social: number;
  met_engage_vote: number;
  met_env_air: number;
  met_env_pollute: number;
  met_env_road: number;
  met_env_water: number;
  met_health_exercise: number;
  met_health_hospital: number;
  met_health_obese: number;
  met_health_sate: number;
  met_health_short: number;
  met_health_smoke: number;
  met_house_access_step: number;
  met_house_burden: number;
  met_house_cost: number;
  met_house_multifam: number;
  met_house_subsidy: number;
  met_opp_age: number;
  met_opp_grad: number;
  met_opp_income: number;
  met_opp_jobs: number;
  met_prox_activity: number;
  met_prox_auto: number;
  met_prox_land_use: number;
  met_prox_lib: number;
  met_prox_market: number;
  met_prox_park: number;
  met_prox_sec: number;
  met_prox_trans: number;
  met_prox_vacant: number;
  met_trans_access: number;
  met_trans_cost: number;
  met_trans_delay: number;
  met_trans_fatal: number;
  met_trans_freq: number;
  met_trans_limit: number;
  met_trans_walk: number;
}

export interface LivabilityPolicies {
  pol_engage_broad: boolean;
  pol_engage_lgbt: boolean;
  pol_engage_right: boolean;
  pol_engage_vote: boolean;
  pol_env_connect: boolean;
  pol_env_eff: boolean;
  pol_env_hazard: boolean;
  pol_health_smoke: boolean;
  pol_house_adu: boolean;
  pol_house_foreclose: boolean;
  pol_house_mfg: boolean;
  pol_house_trust: boolean;
  pol_house_visit: boolean;
  pol_mult_age_friend: boolean;
  pol_opp_credit: boolean;
  pol_opp_leave: boolean;
  pol_opp_wage: boolean;
  pol_prox_tod: boolean;
  pol_trans_coord: boolean;
  pol_trans_full_st: boolean;
  pol_trans_vol: boolean;
}

export interface LivabilityDemographics {
  demo_50: number;
  demo_65: number;
  demo_african: number;
  demo_asian: number;
  demo_disable: number;
  demo_hawaiian: number;
  demo_hisp: number;
  demo_income: number;
  demo_indian: number;
  demo_life_ex: number;
  demo_more_races: number;
  demo_noveh: number;
  demo_other_race: number;
  demo_pop: number;
  demo_poverty: number;
  demo_up_mobile: number;
  demo_white: number;
}

export interface LivabilityClimate {
  climate_jan_avg: number;
  climate_jan_min: number;
  climate_jan_max: number;
  climate_jan_ppt_avg: number;
  climate_jul_avg: number;
  climate_jul_min: number;
  climate_jul_max: number;
  climate_jul_ppt_avg: number;
}

export interface LivabilityRegion {
  id: number;
  geoid: string;
  score: number;
  score_engage: number;
  score_env: number;
  score_health: number;
  score_house: number;
  score_opp: number;
  score_prox: number;
  score_trans: number;
  metrics: LivabilityMetrics;
  policies: LivabilityPolicies;
  demographics: LivabilityDemographics;
  climate: LivabilityClimate;
  disaster_natural_hazard_risk: number;
  employ_unemp_rate: number;
  geometry: MultiPolygon;
}
