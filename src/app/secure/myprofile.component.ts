import {Component} from "@angular/core";
import {LoggedInCallback, UserLoginService, UserParametersService, Callback} from "../service/cognito.service";
import {Router} from "@angular/router";


@Component({
  selector: 'awscognito-angular2-app',
  templateUrl: '/app/template/secure/myprofile.html'
})
export class MyProfileComponent implements LoggedInCallback {

  public parameters:Array<Parameters> = [];

  constructor(public loginService:UserLoginService, public userParamsService:UserParametersService, public router:Router) {
    loginService.isAuthenticated(this);
    console.log("In MyProfileComponent");

  }

  isLoggedIn(message:string, isLoggedIn:boolean) {
    if (!isLoggedIn) {
      this.router.navigate(['/home/login']);
    } else {
      UserParametersService.getParameters(new GetParametersCallback(this));
    }
  }

}

export class Parameters {
  name:string;
  value:string;
}

export class GetParametersCallback implements Callback {

  constructor(public me:MyProfileComponent) {

  }

  callback() {

  }

  callbackWithParam(result:any) {
    for (let i = 0; i < result.length; i++) {
      let parameter = new Parameters();
      parameter.name = result[i].getName();
      parameter.value = result[i].getValue();
      this.me.parameters.push(parameter);
    }
  }
}
