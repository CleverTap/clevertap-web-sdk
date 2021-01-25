import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import clevertap from 'clevertap-web-sdk';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

clevertap.init('YOUR_ACCOUNT_ID'); // Replace YOUR_ACCOUNT_ID, can be initialized just once

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
