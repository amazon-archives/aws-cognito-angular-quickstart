import {Component} from "@angular/core";
import {LoggedInCallback, UserLoginService, CognitoUtil, Callback} from "../service/cognito.service";
import {Router} from "@angular/router";

export class Stuff {
  public accessToken :string;
}

@Component({
  selector: 'awscognito-angular2-app',
  templateUrl: '/app/template/secure/jwt.html'
})
export class JwtComponent implements LoggedInCallback, Callback {

  public stuff  = new Stuff();


  constructor(public loginService:UserLoginService, public cognitoUtil:CognitoUtil, public router:Router) {
    loginService.isAuthenticated(this);
    console.log("in JwtComponent");
    console.log("accessToken: " + this.cognitoUtil.credentials._ACCESS_TOKEN_JWT);


  }

  isLoggedIn(message:string, isLoggedIn:boolean) {
    if (!isLoggedIn) {
      console.log("In JWTComponent:isLoggedIn:isLoggedIn");
      this.router.navigate(['/home/login']);
    }
    else {
      this.cognitoUtil.setCredentials(this.cognitoUtil, this);
    }
  }

  callback() {
    this.stuff.accessToken = this.cognitoUtil.credentials._ID_TOKEN_JWT;
  }
  callbackWithParam(result){}
}
