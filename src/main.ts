import {bootstrap} from '@angular/platform-browser-dynamic';
import {enableProdMode, provide} from '@angular/core';
import {ROUTER_PROVIDERS} from "@angular/router";
import {LocationStrategy, HashLocationStrategy} from "@angular/common";
import {environment} from './app/environment';
import {AppComponent} from './app/app.component';

if (environment.production) {
  enableProdMode();
}

bootstrap(AppComponent, [ROUTER_PROVIDERS]);
//, provide(LocationStrategy, {useClass: HashLocationStrategy})
