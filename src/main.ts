import {bootstrap} from "@angular/platform-browser-dynamic";
import {enableProdMode} from "@angular/core";
import {ROUTER_PROVIDERS} from "@angular/router";
import {environment} from "./app/environment";
import {AppComponent} from "./app/app.component";
import {CognitoUtil} from "./app/service/cognito.service";

if (environment.production) {
  enableProdMode();
}

var myApp = bootstrap(AppComponent, [ROUTER_PROVIDERS, CognitoUtil]);

