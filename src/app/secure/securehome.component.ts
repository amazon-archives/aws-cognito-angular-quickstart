import {Component, OnInit} from "@angular/core";
import {Router} from "@angular/router";
import {LoggedInCallback, UserLoginService} from "../service/cognito.service";

@Component({
  selector: 'awscognito-angular2-app',
  templateUrl: './secureHome.html'
  // styleUrls: ['/assets/css/sb-admin.css']
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

