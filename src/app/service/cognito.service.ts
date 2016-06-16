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

export interface Callback {
  callback();
  callbackWithParam(result:any);
}

export class CognitoCredentials {

  public _ACCESS_KEY:any;
  public _SECRET_ACCESS_KEY:any;
  public _SESSION_TOKEN:any;

  public _ACCESS_TOKEN_JWT:string;
  public _ID_TOKEN_JWT:string;
  public _REFRESH_TOKEN:any;

  constructor() {
    console.log("In CognitoCredentials");
  };


}
@Injectable()
export class CognitoUtil {

  public credentials = new CognitoCredentials();
  private authenticatedUser : any;

  public _REGION = "us-east-1";

  public _IDENTITY_POOL_ID = "us-east-1:fbe0340f-9ffc-4449-a935-bb6a6661fd53";
  private _USER_POOL_ID = "us-east-1_PGSbCVZ7S";
  public _CLIENT_ID = "hh5ibv67so0qukt55c5ulaltk";

  public poolData = {
    UserPoolId: this._USER_POOL_ID,
    ClientId: this._CLIENT_ID
  };

  constructor() {
    console.log("in CognitoUtil");
    this.ngOnInit();
  }

  reset() {
    this.credentials = new CognitoCredentials();
  }

  ngOnInit() {
    AWS.config.region = this._REGION;
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: this._IDENTITY_POOL_ID
    });

    AWSCognito.config.region = this._REGION;
    AWSCognito.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: this._IDENTITY_POOL_ID
    });
  }

  public getUserPool() {
    return new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(this.poolData);

  }

  public getCurrentUser() {
    if (this.authenticatedUser != null)
      return this.authenticatedUser;

    var curUser = this.getUserPool().getCurrentUser();

    if (curUser == null) {
      console.log("CurrentUser is null...let's create one");
      var userData = {
        Username: 'username',
        Pool: this.getUserPool()
      };
      curUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);
    }
    return curUser;
  }

  public getCognitoIdentity() {
    return AWS.config.credentials.identityId;
  }

  setCredentials(cognitoUtils:CognitoUtil, callback:Callback) {
    cognitoUtils.getCurrentUser().getSession(function (err, session) {
      if (err)
        console.log("Can't set the credentials:" + err);
      else {
        if (session.isValid()) {
          cognitoUtils.credentials._ACCESS_TOKEN_JWT = session.getAccessToken().getJwtToken();
          cognitoUtils.credentials._ID_TOKEN_JWT = session.getIdToken().getJwtToken();
          cognitoUtils.credentials._REFRESH_TOKEN = session.getRefreshToken();

          AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: cognitoUtils.credentials._ID_TOKEN_JWT,
            Logins: {
              // Change the key below according to the specific region your user pool is in.
              'cognito-idp.us-east-1.amazonaws.com/us-east-1_TcoKGbf7n': cognitoUtils.credentials._ID_TOKEN_JWT
            }
          });

          if (callback != null) {
            callback.callback();
          }

        }
      }


    });
  }

  getAccessKeyJwt(cognitoCallback:CognitoCallback) {
    if (this.getCurrentUser() != null) {
      this.getCurrentUser().getSession(function (err, session) {
        if (err) {
          return;
        }
        session.getIdToken().getJwtToken();
      });
    }

  }
}

@Injectable()
export class UserRegistrationService {

  constructor(@Inject(CognitoUtil) public cognitoConfigs:CognitoUtil) {

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
    attributeList.push(new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataEmail));
    attributeList.push(new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataNickname));

    this.cognitoConfigs.getUserPool().signUp(user.email, user.password, attributeList, null, function (err, result) {
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
      Pool: this.cognitoConfigs.getUserPool()
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
      Pool: this.cognitoConfigs.getUserPool()
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

  constructor(@Inject(CognitoUtil) public cognitoUtil:CognitoUtil) {

  }

  setCredentials(result:any) {

    this.cognitoUtil.credentials._ACCESS_TOKEN_JWT = result.getAccessToken().getJwtToken();
    this.cognitoUtil.credentials._ID_TOKEN_JWT = result.getIdToken().getJwtToken();
    // this.cognitoUtil.credentials._REFRESH_TOKEN_JWT = result.getRefreshToken().getJwtToken();

    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: this.cognitoUtil.credentials._ID_TOKEN_JWT,
      Logins: {
        // Change the key below according to the specific region your user pool is in.
        'cognito-idp.us-east-1.amazonaws.com/us-east-1_TcoKGbf7n': this.cognitoUtil.credentials._ID_TOKEN_JWT
      }
    });

  }

  // initUnauthenticatedUser() {
  //
  // }
}

@Injectable()
export class UserLoginService {

  constructor(@Inject(CognitoUtil) public cognitoUtil:CognitoUtil) {
  }

  authenticate(username:string, password:string, callback:CognitoCallback) {
    var authenticationData = {
      Username: username,
      Password: password,
    };
    var authenticationDetails = new AWSCognito.CognitoIdentityServiceProvider.AuthenticationDetails(authenticationData);

    var userData = {
      Username: username,
      Pool: this.cognitoUtil.getUserPool()
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
      Pool: this.cognitoUtil.getUserPool()
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
      Pool: this.cognitoUtil.getUserPool()
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
    this.cognitoUtil.getCurrentUser().signOut();
  }

  isAuthenticated(callback:LoggedInCallback) {
    var cognitoUser = this.cognitoUtil.getCurrentUser();


    if (cognitoUser != null) {
      cognitoUser.getSession(function (err, session) {
        if (err)
          callback.isLoggedIn(null, false);
        else {
          console.log("session: " + session.isValid());
          callback.isLoggedIn(err, session.isValid());
        }

      });
    } else {
      callback.isLoggedIn(null, false);
    }
  }

}

@Injectable()
export class UserParametersService {

  constructor(@Inject(CognitoUtil) public cognitoUtil:CognitoUtil) {

  }

  getParameters(cognitoUtil:CognitoUtil, callback:Callback) {

    var cognitoUser = cognitoUtil.getCurrentUser();

    cognitoUser.getUserAttributes(function(err, result) {
      if (err) {
        console.log("in getParameters: " + err);
        });
      } else {
        callback.callbackWithParam(result);
      }
    });

  }

  getParameter(name:string, callback:Callback) {

  }

}
