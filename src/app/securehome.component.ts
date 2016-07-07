import {Component, OnInit} from "@angular/core";
import {Router, ROUTER_DIRECTIVES} from "@angular/router";
import {LoggedInCallback, UserLoginService} from "./service/cognito.service";


@Component({
  selector: 'awscognito-angular2-app',
  templateUrl: '/app/template/secure/secureHome.html',
  directives: [ROUTER_DIRECTIVES],
  styleUrls: ['/css/sb-admin.css']
})
export class SecureHomeComponent implements OnInit, LoggedInCallback {

  constructor(public router:Router) {
    UserLoginService.isAuthenticated(this);
    console.log("in SecureHomeComponent");
  }

  ngOnInit() {

  }

  isLoggedIn(message:string, isLoggedIn:boolean) {
    if (!isLoggedIn) {
      this.router.navigate(['/home/login']);
    }
  }
}

