import {Injectable, Inject} from "@angular/core";
import {CognitoUtil} from "./cognito.service";

declare var AWS:any;
declare var AWSCognito:any;

@Injectable()
export class AwsUtil {
  private DDB:any;
  private creds:any;

  constructor(@Inject(CognitoUtil) public cognitoUtil:CognitoUtil) {
    console.log("In AwsConfig");
  }

  setupUnAuthenticatedId() {
    this.creds = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: CognitoUtil._IDENTITY_POOL_ID
    });

    AWS.config.credentials = this.creds;
  }


  userLoggedIn(providerName, token) {
    this.creds.params.Logins = {};
    this.creds.params.Logins[providerName] = token;

    // finally, expire the credentials so we refresh on the next request
    this.creds.expired = true;
  }

  getDDB(accessTokenJwt:string) {

    if (this.DDB != null) {
      console.log("S3 object exists. Returning it");

    } else {


      AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: CognitoUtil._IDENTITY_POOL_ID, // your identity pool id here
        Logins: {
          // Change the key below according to the specific region your user pool is in.
          'cognito-idp.us-east-1.amazonaws.com/us-east-1_TcoKGbf7n': accessTokenJwt
        }
      });

      this.DDB = new AWS.DynamoDB; // we can now create our service object
    }
    return this.DDB;
  }
}
@Injectable()
export class DynamoDBService {


}
