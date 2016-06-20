import {Component, OnInit} from "@angular/core";
import {Routes, Router, ROUTER_DIRECTIVES} from "@angular/router";
import {SecureHomeComponent} from "./secure/securehome.component";
import {UserRegistrationService, UserLoginService, UserParametersService} from "./service/cognito.service";
import {HomeComponent} from "./home.component";
import {AwsUtil} from "./service/aws.service";

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
export class AppComponent implements OnInit {

  /**
   * You have to include router here, even though you're not explicitly using it
   *
   * @param router
   * @param configs
   */
  constructor(private router:Router) {
    console.log("AppComponent constructor");
  }

  ngOnInit() {
    AwsUtil.initAwsService(null);
  }
}

