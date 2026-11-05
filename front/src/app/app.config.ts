import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors, withXsrfConfiguration } from '@angular/common/http';
import { channelInterceptor } from './errorInterceptor';
export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideAnimationsAsync(), provideHttpClient(
    withXsrfConfiguration({
      cookieName: 'csrftoken',
      headerName: 'X-CSRFToken',
    }),
    withInterceptors([channelInterceptor])
  )]
};
