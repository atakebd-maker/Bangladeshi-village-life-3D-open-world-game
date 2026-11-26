# BANGLADESH VILLAGE LIFE 3D — Technical & World Design Document
**Developed by TAHSIN STUDIO**

## 1. Platform & Engine Architecture
- **Engine**: Three.js (WebGL2 PBR with ACES Filmic tone mapping, PMREM studio reflections, procedural CanvasTextures, and custom `onBeforeCompile` water shaders).
- **UI & State Layer**: React 19 + TypeScript + Tailwind CSS v4, communicating via a zero-GC game loop and throttled HUD snapshot bridge.
- **Native Android Packaging**: Configured with Capacitor (`android/capacitor.config.ts`, `AndroidManifest.xml`, `MainActivity.java`) locking the Android activity to `sensorLandscape` and immersive sticky fullscreen with OpenGL ES 3.0 hardware acceleration.

## 2. Open-World Layout (Shonargaon-Inspired Village Map)
The connected 320m x 320m village features terrain elevation (`TerrainSystem`), connected kacha/pucca roads (`RoadSystem`), and water basins (`WaterSystem`):
- **Center Homesteads (North-West & Central)**: Tin-roof Chouchala/Dochala houses, mud & bamboo houses, brick house, courtyards, tube wells, clay stoves (`chula`), bamboo/tin fences, and haystacks.
- **Village Bazaar (East-Central)**: Tea Stall (`চা স্টল`), Grocery Shop (`মুদি দোকান`), Fish & Vegetable Market, Fruit Shop, Barber Shop, Clothing Shop, Local Hotel, and Rickshaw Stand.
- **Public & Cultural Landmarks**: Village School, Madrasa, Mosque with dome & minaret, Village Clinic, Bus Stand on the paved highway, Police Station, and Vehicle Repair Garage.
- **Sports Grounds (South-Central)**: Full interactive Village Cricket Pitch & Boundary + Village Football Pitch with goalposts.
- **Agriculture & River (West & South)**: Lush green paddy fields, golden mustard fields, vegetable gardens, irrigation canal with bamboo bridge (`shako`), pond with water lilies, and wide Padma-style river with wooden & fishing boats.

## 3. Core Gameplay Systems
- **Player Controller**: Third-person & first-person camera, walk, run, sprint, jump, crouch, sit on benches/tea stalls, climb haystacks/veranda steps, punch, kick, block, dodge, outfit customization, and inventory.
- **Vehicles**: 13 authentic Bangladeshi vehicles physically placed around the village, market, stands, and repair garage (Motorcycle, Sports Bike, Bicycle, Auto-Rickshaw, CNG, Battery Easy Bike, Cycle Rickshaw, Car, Jeep, Pickup, Microbus, Local Bus, Truck). Zero dialer/phone-number spawning.
- **Interactive Sports & Missions**: Live 3D village cricket (bowl-to-bat timing, 1/2/3/4/6 runs, catching/wickets, scoreboard, team & over selection), interactive football, and 5 village missions.
- **Dynamic Atmosphere**: 6-stage Day-Night cycle + 6 weather states (Sunny, Cloudy, Rainy, Heavy Rain, Thunderstorm with lightning, Fog) + procedural Web Audio synthesis.
