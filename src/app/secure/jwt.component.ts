import {Component} from "@angular/core";
import {LoggedInCallback, UserLoginService, CognitoUtil, Callback} from "../service/cognito.service";
import {Router} from "@angular/router";


export class Stuff {
  public accessToken:string;
  public idToken:string;
}

@Component({
  selector: 'awscognito-angular2-app',
  templateUrl: '/app/template/secure/jwt.html'
})
export class JwtComponent implements LoggedInCallback {

  public stuff:Stuff = new Stuff();

  constructor(public loginService:UserLoginService, public router:Router) {
    loginService.isAuthenticated(this);
    console.log("in JwtComponent");

  }

  isLoggedIn(message:string, isLoggedIn:boolean) {
    if (!isLoggedIn) {
      this.router.navigate(['/home/login']);
    } else {
      CognitoUtil.getAccessToken(new AccessTokenCallback(this));
      CognitoUtil.getIdToken(new IdTokenCallback(this));
    }
  }
}

export class AccessTokenCallback implements Callback {
  constructor(public jwt:JwtComponent) {

  }

  callback() {

  }

  callbackWithParam(result) {
    this.jwt.stuff.accessToken = result;
  }
}

export class IdTokenCallback implements Callback {
  constructor(public jwt:JwtComponent) {

  }

  callback() {

  }

  callbackWithParam(result) {
    this.jwt.stuff.idToken = result;
  }
}
