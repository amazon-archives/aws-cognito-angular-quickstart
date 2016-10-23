import {Component} from "@angular/core";
import {LoggedInCallback, UserLoginService} from "../service/cognito.service";
import {Router} from "@angular/router";
import {DynamoDBService} from "../service/aws.service";


export class Stuff {
  public type:string;
  public date:string;
}

@Component({
  selector: 'awscognito-angular2-app',
  templateUrl: './useractivity.html'
})
export class UseractivityComponent implements LoggedInCallback {

  public logdata:Array<Stuff> = [];

  constructor(public router:Router) {
    UserLoginService.isAuthenticated(this);
    console.log("in UseractivityComponent");
  }

  isLoggedIn(message:string, isLoggedIn:boolean) {
    if (!isLoggedIn) {
      this.router.navigate(['/home/login']);
    } else {
      console.log("scanning DDB");
      DynamoDBService.getLogEntries(this.logdata);
    }
  }

}
