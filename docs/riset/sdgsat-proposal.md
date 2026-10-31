# SDGSAT-1 Open Science Program: draft proposal

> Draft for the team to paste into the proposal template on www.sdgsat.ac.cn (Proposal Submission).
> Submit it under the principal investigator's own account. Contact: sdgsat1@cbas.ac.cn.
> Check every claim before submitting. Figures here come from SuryaJaga docs (03-ARCHITECTURE Q11-Q12, 04-TODO T7).

## Title
High-resolution nighttime light monitoring of village solar mini-grids in Indonesia (SDG 7.1.1)

## Principal investigator
[Name], Politeknik Negeri Jember, Indonesia. Team of 4 informatics students (SuryaJaga, Seno Hackathon ITS 2026).

## Target SDG
SDG 7 (Affordable and clean energy), indicator 7.1.1: proportion of population with access to electricity.

## Background
Indonesia is building solar power plants (PLTS) for tens of thousands of village cooperatives. Earlier village PLTS
frequently stopped working unnoticed for years. Reported cases include Parang (Karimunjawa, 75 kWp, mostly down since 2019),
Lakarama (Muna, about five years not working normally) and Pulau Burung Loe (Sinjai, not operating since 2018).

We tested NASA Black Marble (VIIRS, ~500 m) on five villages chosen before looking at the data: three with reported failures
and two with working PLTS. All five were below the noise level (2015-2016 baseline 0.00-0.15 nW/cm²/sr), and the working
villages were as dark as the failed ones. VIIRS resolution is too coarse for villages of 200-400 households.

## Research question
Can SDGSAT-1 Glimmer Imager (10-40 m) distinguish village PLTS that are operating from those that have failed, where
VIIRS cannot?

## Study area
Small islands and villages in Indonesia only (no regional or global coverage):
- Parang, Karimunjawa, Central Java (-5.746, 110.242): failed PLTS
- Batu Bingkung, Kepulauan Selayar, South Sulawesi (-7.368, 121.125): working PLTS (comparison)
- Optional: Pulau Burung Loe (-5.118, 120.391) and Pulau Sembur, Batam (0.676, 104.300)

## Data requested
Archived GIU (Glimmer Imager) L4A scenes, 2022 to present, clearest scenes only:
about 2-4 scenes per site, 10-15 scenes in total. Example: KX10_GIU_20261021_E110.42_S4.55_202600093981_L4A (covers Parang).

## Methods
1. Extract radiance in a small window around each village and around the PLTS footprint (OpenStreetMap polygons).
2. Compare failed versus working sites, and village light versus nearby lit towns in the same scene (e.g. Karimunjawa town).
3. Report all results, including negative ones, with the rules fixed before the data are examined.

## Expected outcomes
- A short report on whether 10-40 m nighttime light can detect village mini-grid outages.
- Open-source extraction code (Python) and the per-site results, shared with CBAS.

## Research period
6 months from approval (well within the 24-month limit).
