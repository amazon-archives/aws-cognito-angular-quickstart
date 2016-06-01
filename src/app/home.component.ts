import {Component} from "@angular/core";
import {Routes, ROUTER_DIRECTIVES, Router} from "@angular/router";
import {
  LoginComponent,
  RegisterComponent,
  RegistrationConfirmationComponent,
  ResendCodeComponent,
  ForgotPasswordStep1Component,
  ForgotPassword2Component
} from "./auth.component";


@Component({
  selector: 'awscognito-angular2-app',
  template: '<p>Hello and welcome!"</p>'
})
export class AboutComponent {

}

@Component({
  selector: 'awscognito-angular2-app',
  templateUrl: '/app/template/home.html',
  directives: [ROUTER_DIRECTIVES]
})
@Routes([
  {path: '/about', component: AboutComponent},
  {path: '/login', component: LoginComponent},
  {path: '/register', component: RegisterComponent},
  {path: '/confirmRegistration/:username', component: RegistrationConfirmationComponent},
  {path: '/resendCode', component: ResendCodeComponent},
  {path: '/forgotPassword2/:email', component: ForgotPassword2Component},
  {path: '/forgotPassword', component: ForgotPasswordStep1Component}
])
export class HomeComponent {
  constructor(public router:Router) {
    this.router.navigate(['/home/about']);
  }

}
