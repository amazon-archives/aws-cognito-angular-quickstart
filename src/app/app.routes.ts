import {provideRouter, RouterConfig} from "@angular/router";
import {HomeLandingComponent, AboutComponent, HomeComponent} from "./home.component";
import {
  LoginComponent,
  RegisterComponent,
  RegistrationConfirmationComponent,
  ResendCodeComponent,
  ForgotPassword2Component,
  ForgotPasswordStep1Component,
  LogoutComponent
} from "./public/auth.component";
import {SecureHomeComponent} from "./securehome.component";
import {MyProfileComponent} from "./secure/myprofile.component";
import {JwtComponent} from "./secure/jwt.component";
import {UseractivityComponent} from "./secure/useractivity.component";
import {AppComponent} from "./app.component";

const HomeRoutes:RouterConfig = [
  {

    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    component: HomeComponent,
    children: [
      {path: 'about', component: AboutComponent},
      {path: 'login', component: LoginComponent},
      {path: 'register', component: RegisterComponent},
      {path: 'confirmRegistration/:username', component: RegistrationConfirmationComponent},
      {path: 'resendCode', component: ResendCodeComponent},
      {path: 'forgotPassword/:email', component: ForgotPassword2Component},
      {path: 'forgotPassword', component: ForgotPasswordStep1Component},
      {path: '', component: HomeLandingComponent}
    ]
  },
];

const SecureHomeRoutes:RouterConfig = [
  {

    path: '',
    redirectTo: '/securehome',
    pathMatch: 'full'
  },
  {
    path: 'securehome', component: SecureHomeComponent, children: [
    {path: 'logout', component: LogoutComponent},
    {path: 'jwttokens', component: JwtComponent},
    {path: 'myprofile', component: MyProfileComponent},
    {path: 'useractivity', component: UseractivityComponent},
    {path: '', component: MyProfileComponent}]
  }
];

const routes:RouterConfig = [
  {
    path: '',
    component: AppComponent,
    children: [
      ...HomeRoutes,
      ...SecureHomeRoutes,
      {
        path: '',
        component: HomeComponent
      }
    ]
  },


];

export const APP_ROUTER_PROVIDERS = [
  provideRouter(routes)
];
