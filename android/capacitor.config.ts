interface CapacitorAppConfig {
  appId: string;
  appName: string;
  webDir: string;
  server: {
    androidScheme: string;
  };
  android: {
    allowMixedContent: boolean;
    backgroundColor: string;
  };
}

const config: CapacitorAppConfig = {
  appId: 'com.tahsinstudio.bangladeshvillagelife3d',
  appName: 'BANGLADESH VILLAGE LIFE 3D',
  webDir: '../dist',
  server: {
    androidScheme: 'https',
  },
  android: {
    allowMixedContent: false,
    backgroundColor: '#070b12',
  },
};

export default config;
