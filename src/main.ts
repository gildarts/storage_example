import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import Dropzone from 'dropzone';

import { AppModule } from './app/app.module';

Dropzone.autoDiscover = false;

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
