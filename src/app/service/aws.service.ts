import {Injectable} from "@angular/core";
import {CognitoUtil, UserLoginService, Callback} from "./cognito.service";
import {Stuff} from "../secure/useractivity.component";

declare var AWS:any;
declare var AWSCognito:any;

@Injectable()
export class AwsUtil {
  public static firstLogin:boolean = false;
  public static runningInit:boolean = false;

  /**
   * This is the method that needs to be called in order to init the aws global creds
   */
  static initAwsService(callback:Callback) {

      if (AwsUtil.runningInit) {
        // Need to make sure I don't get into an infinite loop here, so need to exit if this method is running already
        console.log("Aborting running initAwsService()...it's running already.");
        // instead of aborting here, it's best to put a timer
        if (callback!=null) {
          callback.callback();
          callback.callbackWithParam(null);
        }
        return;
      }


    console.log("Running initAwsService()");
    AwsUtil.runningInit = true;
    AWS.config.region = CognitoUtil._REGION;
    AWSCognito.config.region = CognitoUtil._REGION;

    // First check if the user is authenticated already
    UserLoginService.isAuthenticated({
      isLoggedIn(message:string, loggedIn:boolean) {
        // Include the passed-in callback here as well so that it's executed downstream
        AwsUtil.setupAWS(loggedIn, callback);
      }
    });
  }


  /**
   * Sets up the AWS global params
   *
   * @param isLoggedIn
   * @param callback
   */
  static setupAWS(isLoggedIn:boolean, callback:Callback):void {
    console.log("in setupAWS()");
    if (isLoggedIn) {
      console.log("User is logged in");
      CognitoUtil.getIdToken({
        callback() {
        },
        callbackWithParam(idToken:any) {
          AwsUtil.addCognitoCredentials(idToken);
        }
      });
      console.log("Retrieving the id token");

    }
    else {
      console.log("User is not logged in");
      AWSCognito.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: CognitoUtil._IDENTITY_POOL_ID
      });
    }
    AwsUtil.runningInit = false;


    if (callback != null) {
      callback.callback();
      callback.callbackWithParam(null);
    }
  }

  static addCognitoCredentials(idTokenJwt:string):void {
    let params = AwsUtil.getCognitoParametersForIdConsolidation(idTokenJwt);

    AWS.config.credentials = new AWS.CognitoIdentityCredentials(params);
    AWSCognito.config.credentials = new AWS.CognitoIdentityCredentials(params);

    AWS.config.credentials.get(function (err) {
      if (!err) {
        // var id = AWS.config.credentials.identityId;
        if (AwsUtil.firstLogin) {
          // save the login info to DDB
          DynamoDBService.writeLogEntry("login");
          AwsUtil.firstLogin = false;
        }
      }
    });
  }

  public static getCognitoParametersForIdConsolidation(idTokenJwt:string):{} {
    console.log("enter getCognitoParametersForIdConsolidation()");
    let url = 'cognito-idp.' + CognitoUtil._REGION.toLowerCase() + '.amazonaws.com/' + CognitoUtil._USER_POOL_ID;
    let logins:Array<string> = [];
    logins[url] = idTokenJwt;
    let params = {
      IdentityPoolId: CognitoUtil._IDENTITY_POOL_ID, /* required */
      Logins: logins
    };

    return params;
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
        ":userId": AWS.config.credentials.params.IdentityId
      }
    };
    var docClient = new AWS.DynamoDB.DocumentClient();
    docClient.query(params, onQuery);

    function onQuery(err, data) {
      if (err) {
        console.error("Unable to query the table. Error JSON:", JSON.stringify(err, null, 2));
      } else {
        // print all the movies
        console.log("Query succeeded.");
        data.Items.forEach(function (logitem) {
          mapArray.push({type: logitem.type, date: logitem.activityDate});
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
    });
  }

}

