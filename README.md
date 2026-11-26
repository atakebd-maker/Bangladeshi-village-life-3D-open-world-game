# BANGLADESH VILLAGE LIFE 3D

**Developed by TAHSIN STUDIO**

A playable 3D open-world rural Bangladesh village simulation and adventure game built with **Three.js (WebGL2 PBR)**, **TypeScript**, and **React**, paired with a native **Android Capacitor** landscape configuration.

## Platform Note
This workspace runs in a Node.js + Vite WebGL environment (Unity is not installed in the cloud sandbox). Accordingly, the live preview runs directly as a hardware-accelerated WebGL 3D game in the browser, while the `android/` directory provides the native Android Capacitor configuration (`AndroidManifest.xml` and `MainActivity.java`) for compiling a standalone Android APK locked to `sensorLandscape` fullscreen mode.

In web previews, the game requests `screen.orientation.lock('landscape')` when fullscreen is supported by the browser and always renders in a responsive horizontal landscape game layout without showing any "rotate your device" screen.

## Running & Building (Web)
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server on port 3000:
   ```bash
   npm run dev
   ```
3. Type-check and build the production bundle:
   ```bash
   npm run lint
   npm run build
   ```

## Exporting as an Android APK (Capacitor)
1. Build the production web bundle (`npm run build` outputs to `dist/`).
2. Install Capacitor CLI & Android platform locally:
   ```bash
   npm install @capacitor/core @capacitor/cli @capacitor/android
   npx cap add android
   ```
3. Copy the provided `android/capacitor.config.ts`, `android/app/src/main/AndroidManifest.xml`, and `android/app/src/main/java/com/tahsinstudio/bangladeshvillagelife3d/MainActivity.java` into your Capacitor Android project if not already merged.
4. Sync and open in Android Studio to build a signed `.apk` / `.aab`:
   ```bash
   npx cap sync android
   npx cap open android
   ```

## Controls
- **Mobile Touch**: Left virtual joystick to move; right-side buttons for Jump, Sprint, Crouch, Sit, Punch, Kick, Block, Dodge, Interact, and Enter/Exit Vehicle. Drag anywhere on the open screen to rotate the camera. Driving switches right-side buttons to Gas, Brake, Horn, Exit, and left-side Steering.
- **Desktop Keyboard & Mouse**:
  - `W A S D` / Arrow Keys: Move / Drive
  - `Shift`: Sprint | `Space`: Jump / Brake | `C`: Crouch | `V`: Sit/Stand
  - `J`: Punch | `K`: Kick | `L`: Block | `Q`: Dodge
  - `E`: Interact / Play Cricket / Talk | `F`: Enter / Exit Vehicle | `Tab`: Toggle 1st/3rd Person Camera
  - `H`: Horn (in vehicle) | Mouse drag: Rotate camera
