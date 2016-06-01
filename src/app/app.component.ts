import {Component} from "@angular/core";
import {Routes, ROUTER_DIRECTIVES, Router} from "@angular/router";
import {SecureHomeComponent} from "./secure/securehome.component";
import {UserRegistrationService, CognitoConfigs, UserLoginService} from "./service/cognito.service";
import {HomeComponent} from "./home.component";

@Component({
  selector: 'awscognito-angular2-app',
  templateUrl: '/app/template/app.html',
  providers: [CognitoConfigs, UserRegistrationService, UserLoginService],
  directives: [ROUTER_DIRECTIVES]
})
@Routes([
  // {path: '/...',  component: HomeComponent},
  {path: '/home', component: HomeComponent},
  {path: '/securehome', component: SecureHomeComponent}
])
export class AppComponent {

  constructor(private router:Router) {
    console.log("In the AppComponent");
    this.router.navigate(['/home']);
  }


}
