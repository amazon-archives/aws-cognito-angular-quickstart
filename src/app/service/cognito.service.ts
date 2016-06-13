import {Injectable} from "@angular/core";
import {RegistrationUser} from "./../auth.component.ts";


declare var AWS:any;
declare var AWSCognito:any;

export interface CognitoCallback {
  cognitoCallback(message:string, cognitoUser:any);
}

export interface LoggedInCallback {
  isLoggedIn(message:string, loggedIn:boolean);
}

@Injectable()
export class CognitoUtil {

  public _REGION = "us-east-1";

  private _IDENTITY_POOL_ID = "us-east-1:fbe0340f-9ffc-4449-a935-bb6a6661fd53";
  private _USER_POOL_ID = "us-east-1_PGSbCVZ7S";
  public _CLIENT_ID = "hh5ibv67so0qukt55c5ulaltk";

  private poolData = {
    UserPoolId: this._USER_POOL_ID,
    ClientId: this._CLIENT_ID
  };

  public userPool:any;
  public awsCognito:any;

  public curUser:string;
  private cognitoUser:any;

  constructor() {
    console.log("CognitoUtil constructor");
    this.ngOnInit();
  }

  reset() {
    this.userPool = null;
    this.awsCognito = null;
    this.curUser = null;
  }

  ngOnInit() {
    console.log("Running ngOnInit in CognitoUtils");

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

  public getUser() {
    var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(this.poolData);
    this.cognitoUser = userPool.getCurrentUser();

    if (this.cognitoUser != null) {
      this.cognitoUser.getSession(function (err, session) {
        if (err) {
          alert(err);
          return;
        }
        console.log('session validity: ' + session.isValid());
      });
    }
  }

}

@Injectable()
export class UserRegistrationService {

  constructor(public cognitoConfigs:CognitoUtil) {

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

  constructor() {

  }

  initUnauthenticatedUser() {

  }
}

@Injectable()
export class UserLoginService {

  cognitoConfigs:CognitoUtil;

  constructor(cognitoConfigs:CognitoUtil) {
    this.cognitoConfigs = cognitoConfigs;
  }


  authenticate(username:string, password:string, callback:CognitoCallback) {
    var authenticationData = {
      Username: username,
      Password: password,
    };
    var authenticationDetails = new AWSCognito.CognitoIdentityServiceProvider.AuthenticationDetails(authenticationData);

    var userData = {
      Username: username,
      Pool: this.cognitoConfigs.userPool
    };

    let cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: function (result) {
        callback.cognitoCallback(null, result);
        console.log('access token + ' + result.getAccessToken().getJwtToken());
      },
      onFailure: function (err) {
        callback.cognitoCallback(err.message, null);
      },
    });
  }

  forgotPassword(username:string, callback:CognitoCallback) {
    var userData = {
      Username: username,
      Pool: this.cognitoConfigs.userPool
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
      Pool: this.cognitoConfigs.userPool
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
    this.cognitoConfigs.userPool.getCurrentUser().signOut();
  }

  isAuthenticated(callback:LoggedInCallback) {
    var cognitoUser = this.cognitoConfigs.userPool.getCurrentUser();

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
