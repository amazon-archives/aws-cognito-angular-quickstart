import {Injectable} from "@angular/core";
import {CognitoUtil, UserLoginService, Callback, LoggedInCallback} from "./cognito.service";
import {Stuff} from "../secure/useractivity.component";

declare var AWS:any;
declare var AWSCognito:any;

@Injectable()
export class AwsUtil {
  public static firstLogin:boolean = true;

  /**
   * This is the method that needs to be called in order to init the aws global creds
   */
  static initAwsService(callback:Callback) {
    console.log("Setting up the region");
    AWS.config.region = CognitoUtil._REGION;
    AWSCognito.config.region = CognitoUtil._REGION;

    AWSCognito.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: CognitoUtil._IDENTITY_POOL_ID
    });

    let loginCallback = new LoginCallback(callback);

    UserLoginService.isAuthenticated(loginCallback);
  }

  /**
   * Invoked by the 'initAwsService' method
   */
  static setupAWS(isLoggedIn:boolean):void {
    console.log("in setupAWS()");
    if (isLoggedIn) {
      console.log("User is logged in");
      CognitoUtil.getIdToken(new SetupAwsCallback());
      console.log("Retrieving the access token");

    }
    else {
      console.log("User is not logged in");
      AWSCognito.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: CognitoUtil._IDENTITY_POOL_ID
      });
    }
  }

  static addCognitoCredentials(idTokenJwt:string):void {
    let params = AwsUtil.getCognitoParametersForIdConsolidation(idTokenJwt);

    AWS.config.credentials = new AWS.CognitoIdentityCredentials(params);
    AwsUtil.getCognitoId(params);
    // AwsUtil.retrieveCognitoIdentityAccessToken(null);
  }

  public static getCognitoParametersForIdConsolidation(idTokenJwt:string):{} {
    console.log("enter getCognitoParametersForIdConsolidation()");
    let url = 'cognito-idp.' + CognitoUtil._REGION.toLowerCase() + '.amazonaws.com/' + CognitoUtil._USER_POOL_ID;
    let logins:Array<string,string> = [];
    logins[url] = idTokenJwt;
    let params = {
      IdentityPoolId: CognitoUtil._IDENTITY_POOL_ID, /* required */
      Logins: logins
    };

    return params;
  }

  public static retrieveCognitoIdentityAccessToken(callback:Callback) {
    AWS.config.credentials.get(function (result) {
      let keys:Array<string> = [];

      // Credentials will be available when this function is called.
      keys.push(AWS.config.credentials.accessKeyId);
      keys.push(AWS.config.credentials.secretAccessKey);
      keys.push(AWS.config.credentials.sessionToken);
      if (callback != null)
        callback.callbackWithParam(keys);
    });
  }

  public static getCognitoId(params:{}) {

    UserLoginService.isAuthenticated({
      isLoggedIn(message:string, loggedIn:boolean): void {
        if (!loggedIn) {
          // The user isn't logged in...just get the unauthenticated token
          params = {
            IdentityPoolId: CognitoUtil._IDENTITY_POOL_ID /* required */
          };

          new AWS.CognitoIdentity().getId(params, function (err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else     console.log("The unauthenticated cognito id:" + data['IdentityId']);           // successful response
          });
        } else {

          CognitoUtil.getIdToken({
            callback(): void {
            },

            callbackWithParam(idToken:any): void {
              console.log("idToken in callback:" + idToken);
              new AWS.CognitoIdentity().getId(AwsUtil.getCognitoParametersForIdConsolidation(idToken), function (err, data) {
                if (err) console.log("error in callback to get id: " + err, err.stack); // an error occurred

                else {
                  console.log("The authenticated cognito id:" + data['IdentityId']);           // successful response
                }

                ;
              });
            }
          });
        }
      }
    })

  }

}

export class LoginCallback implements LoggedInCallback {

  constructor(public callback:Callback) {

  }
  isLoggedIn(message:string, loggedIn:boolean):void {
    if (this.callback != null) {
      this.callback.callback();
    }
    AwsUtil.setupAWS(loggedIn);
  }
}


export class SetupAwsCallback implements Callback {
  callback():void {
  }

  callbackWithParam(idToken:any):void {
    AwsUtil.addCognitoCredentials(idToken);
  }
}
@Injectable()
export class DynamoDBService {

  public static DDB:any;

  static getLogEntries(mapArray:Array<Stuff>) {
    var params = {
      TableName: 'LoginTrail',
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId":AWS.config.credentials.params.IdentityId
      }
    };
    var docClient = new AWS.DynamoDB.DocumentClient();
    docClient.query(params, onQuery);

    function onQuery(err, data) {
      if (err) {
        console.error("Unable to query the table. Error JSON:", JSON.stringify(err, null, 2));
      } else {
        // print all the movies
        console.log("Scan succeeded.");
        data.Items.forEach(function (logitem) {
          mapArray.push({type: logitem.type, date: logitem.activityDate});
          console.log(
            logitem.userId + " : " +
            logitem.type + ": ",
            logitem.activityDate);
        });
      }
    }
  }

  static writeLogEntry(type:string) {
    let date = new Date().toString();
    console.log("Writing log entry..type:" + type + " id: " + AWS.config.credentials.params.IdentityId + " date: " + date);
    DynamoDBService.write(AWS.config.credentials.params.IdentityId, date, type);
  }

  static write(data:string, date:string, type:string):void {
    DynamoDBService.DDB = new AWS.DynamoDB({
      params: {TableName: 'LoginTrail'}
    });

    // Write the item to the table
    var itemParams =
    {
      Item: {
        userId: {S: data},
        activityDate: {S: date},
        type: {S: type}
      }
    };
    DynamoDBService.DDB.putItem(itemParams, function (result) {
      // Read the item from the table
      // table.getItem({Key: {id: {S: key}}}, function (err, data) {
      //   console.log(data.Item); // print the item data
      // });
      console.log(result);
    });
  }

}

