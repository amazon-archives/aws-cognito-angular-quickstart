import {Component} from "@angular/core";
import {LoggedInCallback, UserLoginService, CognitoUtil, UserParametersService, Callback} from "../service/cognito.service";
import {Router} from "@angular/router";

@Component({
  selector: 'awscognito-angular2-app',
  templateUrl: '/app/template/secure/myprofile.html'
})
export class MyProfileComponent implements LoggedInCallback, Callback {
  public parameters:Array<[string, string]>;

  constructor(public loginService:UserLoginService, public cognitoUtil:CognitoUtil, public userService:UserParametersService, public router:Router) {
    loginService.isAuthenticated(this);
    this.userService.getParameters(this.cognitoUtil, this);
  }

  isLoggedIn(message:string, isLoggedIn:boolean) {
    if (!isLoggedIn) {
      console.log("In JWTComponent:isLoggedIn:isLoggedIn");
      this.router.navigate(['/home/login']);
    }
    else {
      this.cognitoUtil.setCredentials(this.cognitoUtil, null);

    }
  }

  callback() {

  }
  callbackWithParam(result:any) {
    let i : number;
    for (i = 0; i < result.length; i++) {
      console.log('attribute ' + result[i].getName() + ' has value ' + result[i].getValue());
    }
  }
}
