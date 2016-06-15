import {Injectable, Inject} from "@angular/core";
import {RegistrationUser} from "./../auth.component.ts";


declare var AWS:any;
declare var AWSCognito:any;

export interface CognitoCallback {
  cognitoCallback(message:string, result:any);
}

export interface LoggedInCallback {
  isLoggedIn(message:string, loggedIn:boolean);
}

export class CognitoCredentials {

  public _ACCESS_KEY : any;
  public _SECRET_ACCESS_KEY : any;
  public _SESSION_TOKEN : any;

  public _ACCESS_TOKEN_JWT : any;
  public _ID_TOKEN_JWT : any;
  public _REFRESH_TOKEN_JWT : any;

  constructor() {};


}
@Injectable()
export class CognitoUtil {

  public cachedCredentials : CognitoCredentials;

  public _REGION = "us-east-1";

  public _IDENTITY_POOL_ID = "us-east-1:fbe0340f-9ffc-4449-a935-bb6a6661fd53";
  private _USER_POOL_ID = "us-east-1_PGSbCVZ7S";
  public _CLIENT_ID = "hh5ibv67so0qukt55c5ulaltk";

  private poolData = {
    UserPoolId: this._USER_POOL_ID,
    ClientId: this._CLIENT_ID
  };

  public userPool:any;
  public awsCognito:any;

  public curUser:string;

  constructor() {
    console.log("CognitoUtil constructor");
    this.ngOnInit();
  }

  reset() {
    this.userPool = null;
    this.awsCognito = null;
    this.curUser = null;
    this.cachedCredentials = null;
  }

  ngOnInit() {
    console.log("Running ngOnInit in CognitoUtils");
    this.cachedCredentials = new CognitoCredentials();

    AWS.config.region = this._REGION;
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: this._IDENTITY_POOL_ID
    });

    AWSCognito.config.region = this._REGION;
    AWSCognito.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: this._IDENTITY_POOL_ID
    });

    this.awsCognito = AWSCognito;
    console.log("Running ngOnInit in CognitoUtils");
    this.userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(this.poolData);
  }

  public getUser(cognitoCallback:CognitoCallback) {
    var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(this.poolData);
    var cognitoUser = userPool.getCurrentUser();

    if (cognitoUser != null) {
      cognitoUser.getSession(function (err, session) {
        cognitoCallback.cognitoCallback(err, session);
        //
        // if (err) {
        //   console.log(err);
        //   return;
        // }
        // console.log('session validity: ' + session.isValid());
      });
    }
  }

  public getCognitoIdentity() {
    return AWS.config.credentials.identityId;
  }

}

@Injectable()
export class UserRegistrationService {

  constructor( @Inject(CognitoUtil) public cognitoConfigs:CognitoUtil) {

  }

  register(user:RegistrationUser, callback:CognitoCallback) {
    console.log("user: " + user);

    var attributeList = [];

    var dataEmail = {
      Name: 'email',
      Value: user.email
    };
    var dataNickname = {
      Name: 'nickname',
      Value: user.name
    };
    attributeList.push(new this.cognitoConfigs.awsCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataEmail));
    attributeList.push(new this.cognitoConfigs.awsCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataNickname));

    this.cognitoConfigs.userPool.signUp(user.email, user.password, attributeList, null, function (err, result) {
      if (err) {
        callback.cognitoCallback(err.message, null);
      } else {
        console.log("registered user: " + result);
        callback.cognitoCallback(null, result);
      }
    });

  }

  confirmRegistration(username:string, confirmationCode:string, callback:CognitoCallback) {

    var userData = {
      Username: username,
      Pool: this.cognitoConfigs.userPool
    };

    let cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);

    cognitoUser.confirmRegistration(confirmationCode, true, function (err, result) {
      if (err) {
        callback.cognitoCallback(err.message, null);
      } else {
        callback.cognitoCallback(null, result);
      }
    });
  }

  resendCode(username:string, callback:CognitoCallback) {
    var userData = {
      Username: username,
      Pool: this.cognitoConfigs.userPool
    };

    let cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);

    cognitoUser.resendConfirmationCode(function (err, result) {
      if (err) {
        callback.cognitoCallback(err.message, null);
      } else {
        callback.cognitoCallback(null, result);
      }
    });
  }

}

@Injectable()
export class CognitoCredentialsService {

  constructor( @Inject(CognitoUtil) public cognitoUtil:CognitoUtil) {

  }

  setCredentials(result:any) {

    this.cognitoUtil.cachedCredentials._ACCESS_TOKEN_JWT = result.getAccessToken().getJwtToken();
    this.cognitoUtil.cachedCredentials._ID_TOKEN_JWT = result.getIdToken().getJwtToken();
    // this.cognitoUtil.cachedCredentials._REFRESH_TOKEN_JWT = result.getRefreshToken().getJwtToken();

    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId : this.cognitoUtil.cachedCredentials._ID_TOKEN_JWT,
      Logins : {
        // Change the key below according to the specific region your user pool is in.
        'cognito-idp.us-east-1.amazonaws.com/us-east-1_TcoKGbf7n' : this.cognitoUtil.cachedCredentials._ID_TOKEN_JWT
      }
    });

  }
  // initUnauthenticatedUser() {
  //
  // }
}

@Injectable()
export class UserLoginService {

  constructor(  @Inject(CognitoUtil) public cognitoUtil:CognitoUtil) {
  }

  authenticate(username:string, password:string, callback:CognitoCallback) {
    var authenticationData = {
      Username: username,
      Password: password,
    };
    var authenticationDetails = new AWSCognito.CognitoIdentityServiceProvider.AuthenticationDetails(authenticationData);

    var userData = {
      Username: username,
      Pool: this.cognitoUtil.userPool
    };

    let cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: function (result) {
        callback.cognitoCallback(null, result);
      },
      onFailure: function (err) {
        callback.cognitoCallback(err.message, null);
      },
    });
  }

  forgotPassword(username:string, callback:CognitoCallback) {
    var userData = {
      Username: username,
      Pool: this.cognitoUtil.userPool
    };

    let cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);

    cognitoUser.forgotPassword({
      onSuccess: function (result) {

      },
      onFailure: function (err) {
        callback.cognitoCallback(err.message, null);
      },
      inputVerificationCode() {
        callback.cognitoCallback(null, null);
      }
    });
  }

  confirmNewPassword(email:string, verificationCode:string, password:string, callback:CognitoCallback) {
    var userData = {
      Username: email,
      Pool: this.cognitoUtil.userPool
    };

    let cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);

    cognitoUser.confirmPassword(verificationCode, password, {
      onSuccess: function (result) {
        callback.cognitoCallback(null, result);
      },
      onFailure: function (err) {
        callback.cognitoCallback(err.message, null);
      }
    });
  }

  logout() {
    console.log("Logging out");
    this.cognitoUtil.userPool.getCurrentUser().signOut();
  }

  isAuthenticated(callback:LoggedInCallback) {
    var cognitoUser = this.cognitoUtil.userPool.getCurrentUser();

    if (cognitoUser != null) {
      cognitoUser.getSession(function (err, session) {
        if (err)
          callback.isLoggedIn(null, false);
        else
          callback.isLoggedIn(err, session.isValid());
      });
    } else {
      callback.isLoggedIn(null, false);
    }
  }

}

// @Injectable
// export class JwtService {
//
//   constructor() {
//
//   }
//
//   decode(encodedJwtToken:any) {
//
//   }
//
// }
