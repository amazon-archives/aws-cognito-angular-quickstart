import {Component, OnInit, OnDestroy} from "@angular/core";
import {ROUTER_DIRECTIVES, Router, ActivatedRoute} from "@angular/router";
import {
  CognitoUtil,
  UserRegistrationService,
  CognitoCallback,
  UserLoginService,
  LoggedInCallback
} from "../service/cognito.service";

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
export class LoginComponent implements CognitoCallback, LoggedInCallback, OnInit {
  email:string;
  password:string;
  errorMessage:string;

  constructor(public configs:CognitoUtil,
              public router:Router) {
    console.log("LoginComponent constructor");
  }

  ngOnInit() {
    this.errorMessage = null;
    console.log("Checking if the user is already authenticated. If so, then redirect to the secure site");
    UserLoginService.isAuthenticated(this);
  }

  onLogin() {
    if (this.email == null || this.password == null) {
      this.errorMessage = "All fields are required";
      return;
    }
    this.errorMessage = null;
    UserLoginService.authenticate(this.email, this.password, this);
  }

  cognitoCallback(message:string, result:any) {
    if (message != null) { //error
      this.errorMessage = message;
      console.log("result: " + this.errorMessage);
    } else { //success
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

  constructor(public router:Router) {
    UserLoginService.isAuthenticated(this)
  }

  isLoggedIn(message:string, isLoggedIn:boolean) {
    if (isLoggedIn) {
      UserLoginService.logout();
      this.router.navigate(['/home']);
    }

    this.router.navigate(['/home']);
  }
}

@Component({
  selector: 'awscognito-angular2-app',
  directives: [ROUTER_DIRECTIVES],
  templateUrl: '/app/template/auth/confirmRegistration.html'
})
export class RegistrationConfirmationComponent implements OnInit, OnDestroy {
  confirmationCode:string;
  email:string;
  errorMessage:string;
  private sub:any;

  constructor(public configs:CognitoUtil, public regService:UserRegistrationService, public router:Router, public route:ActivatedRoute) {
  }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.email = params['email'];

    });

    this.errorMessage = null;
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
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

  constructor(public configs:CognitoUtil, public router:Router) {
    this.errorMessage = null;
  }

  onNext() {
    this.errorMessage = null;
    UserLoginService.forgotPassword(this.email, this);
  }

  cognitoCallback(message:string, result:any) {
    if (message == null && result == null) { //error
      this.router.navigate(['/home/forgotPassword', this.email]);
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
export class ForgotPassword2Component implements CognitoCallback, OnInit, OnDestroy {

  verificationCode:string;
  email:string;
  password:string;
  errorMessage:string;
  private sub:any;

  constructor(public router:Router, public route:ActivatedRoute) {
    console.log("email from the url: " + this.email);
  }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.email = params['email'];

    });
    this.errorMessage = null;
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  onNext() {
    this.errorMessage = null;
    UserLoginService.confirmNewPassword(this.email, this.verificationCode, this.password, this);
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
