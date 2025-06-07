import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getAnalytics, provideAnalytics, ScreenTrackingService, UserTrackingService } from '@angular/fire/analytics';
import { initializeAppCheck, provideAppCheck, ReCaptchaEnterpriseProvider, CustomProvider } from '@angular/fire/app-check';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { getFunctions, provideFunctions } from '@angular/fire/functions';
import { getMessaging, provideMessaging } from '@angular/fire/messaging';
import { getPerformance, providePerformance } from '@angular/fire/performance';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { getRemoteConfig, provideRemoteConfig } from '@angular/fire/remote-config';
import { getVertexAI, provideVertexAI } from '@angular/fire/vertexai-preview';
import { provideAnimations } from '@angular/platform-browser/animations';

const isDev = location.hostname === 'localhost';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimations(),
    provideFirebaseApp(() =>
      initializeApp({
        apiKey: "AIzaSyBN8GGpXi4fUV5iZ4fWskI2DM2c49LzfPM",
        authDomain: "gainstracker-21592.firebaseapp.com",
        projectId: "gainstracker-21592",
        storageBucket: "gainstracker-21592.firebasestorage.app",
        messagingSenderId: "825525128907",
        appId: "1:825525128907:web:65f2ae1ed99973340e954e",
        measurementId: "G-JZX067XBJC"
      })
    ),
    ScreenTrackingService,
    UserTrackingService,

    /*
    provideAppCheck(() => {
      const provider = isDev
        ? new CustomProvider({
          getToken: () => Promise.resolve({
            token: 'fake-debug-token',
            expireTimeMillis: Date.now() + 60 * 60 * 1000 // 1 hora en milisegundos
          })

        })
        : new ReCaptchaEnterpriseProvider('C8234AEF-11E1-420F-AA53-8529BE4E831F');

      return initializeAppCheck(undefined, {
        provider,
        isTokenAutoRefreshEnabled: true,
      });
    }),
    */
   
    provideAuth(() => getAuth()),
    provideAnalytics(() => getAnalytics()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),

  ],
};
