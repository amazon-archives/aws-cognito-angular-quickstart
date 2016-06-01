import {Component} from "@angular/core";
import {LoggedInCallback, UserLoginService} from "../service/cognito.service";
import {Router} from "@angular/router";

@Component({
  selector: 'awscognito-angular2-app',
  templateUrl: '/app/template/secure/myprofile.html'
})
export class MyProfileComponent implements LoggedInCallback {
  constructor(public loginService:UserLoginService, public router:Router) {
    loginService.isAuthenticated(this);
  }

  isLoggedIn(message:string, isLoggedIn:boolean) {
    if (isLoggedIn)
      this.router.navigate(['/securehome']);
  }
}
