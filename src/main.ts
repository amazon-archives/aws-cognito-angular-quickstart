/**
 * @author Vladimir Budilov
 *
 * This file initializes the whole angular ecosystem. It's invoked by the SystemJS from the
 * index.html file.
 *
 */
import {bootstrap} from "@angular/platform-browser-dynamic";
import {enableProdMode} from "@angular/core";
import { APP_ROUTER_PROVIDERS } from './app/app.routes';
import {environment} from "./app/environment";
import {AppComponent} from "./app/app.component";
import {CognitoUtil} from "./app/service/cognito.service";

if (environment.production) {
  enableProdMode();
}

bootstrap(AppComponent,
  [APP_ROUTER_PROVIDERS, CognitoUtil])
  .catch(err => console.error(err));;
