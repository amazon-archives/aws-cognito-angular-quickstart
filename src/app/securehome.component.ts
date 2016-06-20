import {Component, OnInit} from "@angular/core";
import {Router, Routes, ROUTER_DIRECTIVES} from "@angular/router";
import {LogoutComponent} from "./public/auth.component";
import {MyProfileComponent} from "./secure/myprofile.component";
import {JwtComponent} from "./secure/jwt.component";
import {LoggedInCallback, UserLoginService} from "./service/cognito.service";
import {UseractivityComponent} from "./secure/useractivity.component";
import {AwsUtil} from "./service/aws.service";


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
  {path: '/myprofile', component: MyProfileComponent},
  {path: '/useractivity', component: UseractivityComponent}
])
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

