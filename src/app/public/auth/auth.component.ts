import {Component, OnInit, OnDestroy} from "@angular/core";
import {Router, ActivatedRoute} from "@angular/router";
import {
    UserRegistrationService,
    CognitoCallback,
    UserLoginService,
    LoggedInCallback
} from "../../service/cognito.service";
import {DynamoDBService} from "../../service/ddb.service";

export class RegistrationUser {
    name:string;
    email:string;
    password:string;
}

@Component({
    selector: 'awscognito-angular2-app',
    templateUrl: './login.html'
})
export class LoginComponent implements CognitoCallback, LoggedInCallback, OnInit {
    email:string;
    password:string;
    errorMessage:string;

    constructor(public router:Router,
                public ddb:DynamoDBService,
                public userService:UserLoginService) {
        console.log("LoginComponent constructor");
    }

    ngOnInit() {
        this.errorMessage = null;
        console.log("Checking if the user is already authenticated. If so, then redirect to the secure site");
        this.userService.isAuthenticated(this);
    }

    onLogin() {
        if (this.email == null || this.password == null) {
            this.errorMessage = "All fields are required";
            return;
        }
        this.errorMessage = null;
        this.userService.authenticate(this.email, this.password, this);
    }

    cognitoCallback(message:string, result:any) {
        if (message != null) { //error
            this.errorMessage = message;
            console.log("result: " + this.errorMessage);
        } else { //success
            this.ddb.writeLogEntry("login");
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
    template: ''
})
export class LogoutComponent implements LoggedInCallback {

    constructor(public router:Router,
                public userService:UserLoginService) {
        this.userService.isAuthenticated(this)
    }

    isLoggedIn(message:string, isLoggedIn:boolean) {
        if (isLoggedIn) {
            this.userService.logout();
            this.router.navigate(['/home']);
        }

        this.router.navigate(['/home']);
    }
}

@Component({
    selector: 'awscognito-angular2-app',
    templateUrl: './confirmRegistration.html'
})
export class RegistrationConfirmationComponent implements OnInit, OnDestroy {
    confirmationCode:string;
    email:string;
    errorMessage:string;
    private sub:any;

    constructor(public regService:UserRegistrationService, public router:Router, public route:ActivatedRoute) {
    }

    ngOnInit() {
        this.sub = this.route.params.subscribe(params => {
            this.email = params.username;

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
    templateUrl: './resendCode.html'
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
            this.router.navigate(['/home/confirmRegistration', this.email]);
        }
    }
}

@Component({
    selector: 'awscognito-angular2-app',
    templateUrl: './forgotPassword.html'
})
export class ForgotPasswordStep1Component implements CognitoCallback {
    email:string;
    errorMessage:string;

    constructor(public router:Router,
                public userService:UserLoginService) {
        this.errorMessage = null;
    }

    onNext() {
        this.errorMessage = null;
        this.userService.forgotPassword(this.email, this);
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
    templateUrl: './forgotPasswordStep2.html'
})
export class ForgotPassword2Component implements CognitoCallback, OnInit, OnDestroy {

    verificationCode:string;
    email:string;
    password:string;
    errorMessage:string;
    private sub:any;

    constructor(public router:Router, public route:ActivatedRoute,
                public userService:UserLoginService) {
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
        this.userService.confirmNewPassword(this.email, this.verificationCode, this.password, this);
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
    templateUrl: './registration.html'
})
export class RegisterComponent implements CognitoCallback {
    registrationUser:RegistrationUser;
    router:Router;
    errorMessage:string;

    constructor(public userRegistration:UserRegistrationService, router:Router) {
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
