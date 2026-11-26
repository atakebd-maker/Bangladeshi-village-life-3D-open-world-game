import { TextureLibrary } from '../materials/ProceduralTextures';
import { BoatController } from './BoatController';
import { CarController } from './CarController';
import { MotorcycleController } from './MotorcycleController';
import { RickshawController } from './RickshawController';
import { VehicleEntity } from './VehicleController';

export function spawnVillageVehicles(textures: TextureLibrary): VehicleEntity[] {
  const list: VehicleEntity[] = [];

  // 1. Motorcycle parked near Main Homestead (-8, -7) & Garage (74, -10)
  list.push(MotorcycleController.createTwoWheeler('moto-home', 'motorcycle', -8, -7, 0.4, 0xb91c1c, textures));
  list.push(MotorcycleController.createTwoWheeler('moto-garage', 'motorcycle', 74, -8, -Math.PI / 2, 0x1e293b, textures));

  // 2. Sports Bike at Repair Garage (74, -14)
  list.push(MotorcycleController.createTwoWheeler('sport-garage', 'sports_bike', 74, -14, -Math.PI / 2, 0x2563eb, textures));

  // 3. Bicycles near Homestead & School
  list.push(MotorcycleController.createTwoWheeler('bike-home', 'bicycle', -15, 2, Math.PI / 2, 0x15803d, textures));
  list.push(MotorcycleController.createTwoWheeler('bike-school', 'bicycle', -6, -77, 0, 0xd97706, textures));

  // 4. Cycle Rickshaws at Rickshaw Stand & Bazaar
  list.push(RickshawController.createThreeOrEasyBike('rick-stand-1', 'cycle_rickshaw', 56, 11, -Math.PI / 2, textures));
  list.push(RickshawController.createThreeOrEasyBike('rick-bazaar', 'cycle_rickshaw', 26, 8, Math.PI / 2, textures));

  // 5. Green CNG Auto-Rickshaws
  list.push(RickshawController.createThreeOrEasyBike('cng-stand', 'cng', 61, 14, -Math.PI / 2, textures));
  list.push(RickshawController.createThreeOrEasyBike('cng-bus', 'cng', 63, 41, 0, textures));

  // 6. Auto-Rickshaw & Easy Bike
  list.push(RickshawController.createThreeOrEasyBike('auto-bazaar', 'auto_rickshaw', 42, 8, Math.PI, textures));
  list.push(RickshawController.createThreeOrEasyBike('easy-bus', 'easy_bike', 63, 55, 0, textures));

  // 7. Four-wheelers parked physically in the world
  list.push(CarController.createFourWheeler('car-brick', 'car', -4, -50, Math.PI / 2, 0x94a3b8, textures));
  list.push(CarController.createFourWheeler('jeep-police', 'jeep', 74, 32, 0, 0x3f6212, textures));
  list.push(CarController.createFourWheeler('pickup-market', 'pickup', 54, 4, Math.PI, 0x1d4ed8, textures));
  list.push(CarController.createFourWheeler('micro-bus', 'microbus', 64, 62, 0, 0xf1f5f9, textures));
  list.push(CarController.createFourWheeler('local-bus', 'local_bus', 66, 24, Math.PI, 0x15803d, textures));
  list.push(CarController.createFourWheeler('truck-hwy', 'truck', 72, -24, 0, 0xf59e0b, textures));

  // 8. Traditional Wooden Boats (নৌকা) moored along the Padma River Ghats & Padma Char
  list.push(
    BoatController.createBoat('boat-ghat-main', 'ছইওয়ালা নৌকা', -75.4, 10.6, -Math.PI / 2, true, 0x6b3e1d, textures)
  );
  list.push(
    BoatController.createBoat('boat-ghat-north', 'কাঠের ডিঙি নৌকা', -71.2, -16, -Math.PI / 2, false, 0x78350f, textures)
  );
  list.push(
    BoatController.createBoat('boat-char', 'মাছ ধরার নৌকা', -107.6, 10.4, Math.PI / 2, true, 0x5c3415, textures)
  );

  return list;
}
