import {Component} from "@angular/core";
import {LoggedInCallback, UserLoginService, CognitoUtil} from "../service/cognito.service";
import {Router} from "@angular/router";

@Component({
  selector: 'awscognito-angular2-app',
  templateUrl: '/app/template/secure/jwt.html'
})
export class JwtComponent implements LoggedInCallback {

  public accessKey : string;

  constructor(public loginService:UserLoginService, public cognitoUtil:CognitoUtil, public router:Router) {
    loginService.isAuthenticated(this);

    console.log("in JwtComponent");
    console.log("accessToken: " + this.cognitoUtil.cachedCredentials._ACCESS_TOKEN_JWT);
    this.accessKey = this.cognitoUtil.cachedCredentials._ID_TOKEN_JWT;

  }

  isLoggedIn(message:string, isLoggedIn:boolean) {
    if (!isLoggedIn)
      this.router.navigate(['/home/login']);
  }
}
