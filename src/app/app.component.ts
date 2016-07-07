/**
 * @author Vladimir Budilov
 * 
 * This is the entry-way into the routing logic. This is the first component that's called when the app
 * loads. 
 * 
 */
import {Component, OnInit} from "@angular/core";
import {ROUTER_DIRECTIVES} from "@angular/router";
import {UserRegistrationService, UserLoginService, UserParametersService} from "./service/cognito.service";
import {AwsUtil} from "./service/aws.service";

@Component({
  selector: 'awscognito-angular2-app',
  templateUrl: '/app/template/app.html',
  providers: [UserRegistrationService, UserLoginService, UserParametersService],
  directives: [ROUTER_DIRECTIVES]
})
export class AppComponent implements OnInit {

  constructor() {
    console.log("AppComponent constructor");
  }

  ngOnInit() {
    AwsUtil.initAwsService(null);
  }
}

