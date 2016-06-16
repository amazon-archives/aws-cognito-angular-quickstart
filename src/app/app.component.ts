import {Component} from "@angular/core";
import {Routes, Router, ROUTER_DIRECTIVES} from "@angular/router";
import {SecureHomeComponent} from "./secure/securehome.component";
import {UserRegistrationService, CognitoUtil, UserLoginService, UserParametersService} from "./service/cognito.service";
import {HomeComponent} from "./home.component";

@Component({
  selector: 'awscognito-angular2-app',
  templateUrl: '/app/template/app.html',
  providers: [UserRegistrationService, UserLoginService, UserParametersService],
  directives: [ROUTER_DIRECTIVES]
})
@Routes([
  {path: '/', component: HomeComponent},
  {path: '/home', component: HomeComponent},
  {path: '/securehome', component: SecureHomeComponent}
])
export class AppComponent {

  /**
   * You have to include router here, even though you're not explicitly using it
   *
   * @param router
   * @param configs
   */
  constructor(private router:Router, private configs:CognitoUtil) {
    console.log("AppComponent constructor");
    // console.log("Cognito Identity Id: " + configs.getCognitoIdentity());
    // Lets create a cognito id here

  }

}
