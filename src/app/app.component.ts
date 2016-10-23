/**
 * @author Vladimir Budilov
 *
 * This is the entry-way into the routing logic. This is the first component that's called when the app
 * loads.
 *
 */
import {Component, OnInit} from "@angular/core";
import {AwsUtil} from "./service/aws.service";

@Component({
  selector: 'app-root',
  templateUrl: 'template/app.html'
})
export class AppComponent implements OnInit {

  constructor() {
    console.log("AppComponent constructor");
  }

  ngOnInit() {
    AwsUtil.initAwsService(null);
  }
}

