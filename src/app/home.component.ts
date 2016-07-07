import {Component, OnInit} from "@angular/core";
import {ROUTER_DIRECTIVES} from "@angular/router";

declare let AWS:any;
declare let AWSCognito:any;

@Component({
  selector: 'awscognito-angular2-app',
  template: '<p>Hello and welcome!"</p>'
})
export class AboutComponent {

}

@Component({
  selector: 'awscognito-angular2-app',
  templateUrl: '/app/template/public/landinghome.html',
  directives: [ROUTER_DIRECTIVES]
})
export class HomeLandingComponent {
  constructor() {
    console.log("HomeLandingComponent constructor");
  }
}

@Component({
  selector: 'awscognito-angular2-app',
  templateUrl: '/app/template/home.html',
  directives: [ROUTER_DIRECTIVES]
})
export class HomeComponent implements OnInit {
  constructor() {
    console.log("HomeComponent constructor");
  }

  ngOnInit() {

  }
}


