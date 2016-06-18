import {Component, OnInit} from "@angular/core";
import {Router, Routes, ROUTER_DIRECTIVES} from "@angular/router";
import {LogoutComponent} from "./../auth.component";
import {MyProfileComponent} from "./myprofile.component";
import {JwtComponent} from "./jwt.component";
import {LoggedInCallback, UserLoginService, CognitoUtil, Callback} from "../service/cognito.service";


@Component({
  selector: 'awscognito-angular2-app',
  templateUrl: '/app/template/secure/secureHome.html',
  directives: [ROUTER_DIRECTIVES],
  styleUrls: ['/css/sb-admin.css']
})
@Routes([
  {path: '/', component: MyProfileComponent},
  {path: '/logout', component: LogoutComponent},
  {path: '/jwttokens', component: JwtComponent},
  {path: '/myprofile', component: MyProfileComponent}
])
export class SecureHomeComponent implements LoggedInCallback, OnInit {

  constructor(public loginService:UserLoginService, public router:Router) {
    console.log("in SecureHomeComponent");
    console.log("cognito identity: " + CognitoUtil.getCognitoIdentity());
    CognitoUtil.setupCognitoIdentity(new GetKeysCallback(this));
  }

  ngOnInit() {
    this.loginService.isAuthenticated(this);
  }

  isLoggedIn(message:string, isLoggedIn:boolean) {
    if (!isLoggedIn) {
      this.router.navigate(['/home/login']);
    }
  }
}

export class GetKeysCallback implements Callback {

  constructor(public me:SecureHomeComponent) {

  }

  callback() {

  }

  callbackWithParam(result:any) {
    for (let i = 0; i < result.length; i++) {
      console.log("key: " + result[i]);
    }
  }
}


