import {Component} from "@angular/core";
import {ROUTER_DIRECTIVES, Router, RouteSegment} from "@angular/router";
import {
  CognitoUtil,
  UserRegistrationService,
  CognitoCallback,
  UserLoginService,
  LoggedInCallback
} from "./service/cognito.service";

export class RegistrationUser {
  name:string;
  email:string;
  password:string;
  password2:string;
}

@Component({
  selector: 'awscognito-angular2-app',
  templateUrl: '/app/template/auth/login.html',
  directives: [ROUTER_DIRECTIVES]
})
export class LoginComponent implements CognitoCallback, LoggedInCallback {
  email:string;
  password:string;
  errorMessage:string;

  constructor(public configs:CognitoUtil, public loginService:UserLoginService,
              public router:Router) {
    console.log("LoginComponent constructor");
    loginService.isAuthenticated(this);
    this.onInit();
  }

  onInit() {
    console.log("configs: " + this.configs._REGION);
    this.errorMessage = null;
  }

  onLogin() {
    if (this.email == null || this.password == null) {
      this.errorMessage = "All fields are required";
      return;
    }
    this.errorMessage = null;
    this.loginService.authenticate(this.email, this.password, this);
  }

  cognitoCallback(message:string, result:any) {
    if (message != null) { //error
      this.errorMessage = message;
      console.log("result: " + this.errorMessage);
    } else { //success
      //move to the next step
      this.router.navigate(['/securehome']);
    }
  }

  isLoggedIn(message:string, isLoggedIn:boolean) {
    if (isLoggedIn)
      this.router.navigate(['/securehome']);
  }
}

@Component({
  selector: 'awscognito-angular2-app',
  directives: [ROUTER_DIRECTIVES],
  template: ''
})
export class LogoutComponent implements LoggedInCallback {

  constructor(public loginService:UserLoginService, public router:Router) {
    loginService.isAuthenticated(this)
  }

  isLoggedIn(message:string, isLoggedIn:boolean) {
    if (isLoggedIn) {
      this.loginService.logout();
      this.router.navigate(['/home/login']);
    }

    this.router.navigate(['/home']);
  }
}

@Component({
  selector: 'awscognito-angular2-app',
  directives: [ROUTER_DIRECTIVES],
  templateUrl: '/app/template/auth/confirmRegistration.html'
})
export class RegistrationConfirmationComponent {
  confirmationCode:string;
  email:string;
  errorMessage:string;

  constructor(public configs:CognitoUtil, public regService:UserRegistrationService, public router:Router, public params:RouteSegment) {
    this.onInit();
  }

  onInit() {
    this.errorMessage = null;
    this.email = this.params.getParam('username');
  }

  onConfirmRegistration() {
    this.errorMessage = null;
    this.regService.confirmRegistration(this.email, this.confirmationCode, this);
  }

  cognitoCallback(message:string, result:any) {
    if (message != null) { //error
      this.errorMessage = message;
      console.log("message: " + this.errorMessage);
    } else { //success
      //move to the next step
      console.log("Moving to securehome");
      // this.configs.curUser = result.user;
      this.router.navigate(['/securehome']);
    }
  }
}

@Component({
  selector: 'awscognito-angular2-app',
  directives: [ROUTER_DIRECTIVES],
  templateUrl: '/app/template/auth/resendCode.html'
})
export class ResendCodeComponent implements CognitoCallback {

  email:string;
  errorMessage:string;

  constructor(public registrationService:UserRegistrationService, public router:Router) {

  }

  resendCode() {
    this.registrationService.resendCode(this.email, this);
  }

  cognitoCallback(error:any, result:any) {
    if (error != null) {
      this.errorMessage = "Something went wrong...please try again";
    } else {
      this.router.navigate(['/home/confirmRegistration', {username: this.email}]);
    }
  }
}

@Component({
  selector: 'awscognito-angular2-app',
  directives: [ROUTER_DIRECTIVES],
  templateUrl: '/app/template/auth/forgotPassword.html'
})
export class ForgotPasswordStep1Component implements CognitoCallback {
  email:string;
  errorMessage:string;

  constructor(public configs:CognitoUtil, public loginService:UserLoginService, public router:Router) {
    this.errorMessage = null;
  }

  onNext() {
    this.errorMessage = null;
    this.loginService.forgotPassword(this.email, this);
  }

  cognitoCallback(message:string, result:any) {
    if (message == null && result == null) { //error
      this.router.navigate(['/home/forgotPassword2', this.email]);
    } else { //success
      this.errorMessage = message;
    }
  }
}


@Component({
  selector: 'awscognito-angular2-app',
  directives: [ROUTER_DIRECTIVES],
  templateUrl: '/app/template/auth/forgotPasswordStep2.html'
})
export class ForgotPassword2Component implements CognitoCallback {

  verificationCode:string;
  email:string;
  password:string;
  errorMessage:string;


  constructor(public loginService:UserLoginService, public router:Router, public params:RouteSegment) {
    this.onInit();

    this.email = this.params.getParam('email');
    console.log("email from the url: " + this.email);
  }

  onInit() {
    this.errorMessage = null;
  }

  onNext() {
    this.errorMessage = null;
    this.loginService.confirmNewPassword(this.email, this.verificationCode, this.password, this);
  }

  cognitoCallback(message:string) {
    if (message != null) { //error
      this.errorMessage = message;
      console.log("result: " + this.errorMessage);
    } else { //success
      this.router.navigate(['/home/login']);
    }
  }

}
/**
 * This component is responsible for displaying and controlling
 * the registration of the user.
 */
@Component({
  selector: 'awscognito-angular2-app',
  templateUrl: '/app/template/auth/registration.html',
  directives: [ROUTER_DIRECTIVES],
  providers: [UserRegistrationService]
})
export class RegisterComponent implements CognitoCallback {
  registrationUser:RegistrationUser;
  router:Router;
  errorMessage:string;

  constructor(public configs:CognitoUtil, public userRegistration:UserRegistrationService, router:Router) {
    this.router = router;
    this.onInit();
  }

  onInit() {
    console.log("configs: " + this.configs._REGION);
    this.registrationUser = new RegistrationUser();
    this.errorMessage = null;
  }

  onRegister() {
    this.errorMessage = null;
    this.userRegistration.register(this.registrationUser, this);
  }

  cognitoCallback(message:string, result:any) {
    if (message != null) { //error
      this.errorMessage = message;
      console.log("result: " + this.errorMessage);
    } else { //success
      //move to the next step
      console.log("redirecting");
      this.router.navigate(['/home/confirmRegistration', result.user.username]);
    }
  }
}
