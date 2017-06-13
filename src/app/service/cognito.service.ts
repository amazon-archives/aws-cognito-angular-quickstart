import {Injectable, Inject} from "@angular/core";
import {DynamoDBService} from "./ddb.service";
import {RegistrationUser} from "../public/auth/register/registration.component";
import {environment} from "../../environments/environment";
import {NewPasswordUser} from "../public/auth/newpassword/newpassword.component";
import { CognitoUserPool, CognitoUserAttribute, CognitoUser, 
         CognitoIdentityServiceProvider, AuthenticationDetails } from "amazon-cognito-identity-js";
import * as AWS from "aws-sdk/global";


/**
 * Created by Vladimir Budilov
 */

export interface CognitoCallback {
    cognitoCallback(message: string, result: any): void;
}

export interface LoggedInCallback {
    isLoggedIn(message: string, loggedIn: boolean): void;
}

export interface Callback {
    callback(): void;
    callbackWithParam(result: any): void;
}

@Injectable()
export class CognitoUtil {

    public static _REGION = environment.region;

    public static _IDENTITY_POOL_ID = environment.identityPoolId;
    public static _USER_POOL_ID = environment.userPoolId;
    public static _CLIENT_ID = environment.clientId;

    public static _POOL_DATA = {
        UserPoolId: CognitoUtil._USER_POOL_ID,
        ClientId: CognitoUtil._CLIENT_ID
    };

    getUserPool() {
        return new CognitoUserPool(CognitoUtil._POOL_DATA);
    }

    getCurrentUser() {
        return this.getUserPool().getCurrentUser();
    }


    getCognitoIdentity(): string {
        return (<AWS.CognitoIdentityCredentials>AWS.config.credentials).identityId;
    }

    getAccessToken(callback: Callback): void {
        if (callback == null) {
            throw("CognitoUtil: callback in getAccessToken is null...returning");
        }
        if (this.getCurrentUser() != null)
            this.getCurrentUser().getSession(function (err, session) {
                if (err) {
                    console.log("CognitoUtil: Can't set the credentials:" + err);
                    callback.callbackWithParam(null);
                }

                else {
                    if (session.isValid()) {
                        callback.callbackWithParam(session.getAccessToken().getJwtToken());
                    }
                }
            });
        else
            callback.callbackWithParam(null);
    }

    getIdToken(callback: Callback): void {
        if (callback == null) {
            throw("CognitoUtil: callback in getIdToken is null...returning");
        }
        if (this.getCurrentUser() != null)
            this.getCurrentUser().getSession(function (err, session) {
                if (err) {
                    console.log("CognitoUtil: Can't set the credentials:" + err);
                    callback.callbackWithParam(null);
                }
                else {
                    if (session.isValid()) {
                        callback.callbackWithParam(session.getIdToken().getJwtToken());
                    } else {
                        console.log("CognitoUtil: Got the id token, but the session isn't valid");
                    }
                }
            });
        else
            callback.callbackWithParam(null);
    }

    getRefreshToken(callback: Callback): void {
        if (callback == null) {
            throw("CognitoUtil: callback in getRefreshToken is null...returning");
        }
        if (this.getCurrentUser() != null)
            this.getCurrentUser().getSession(function (err, session) {
                if (err) {
                    console.log("CognitoUtil: Can't set the credentials:" + err);
                    callback.callbackWithParam(null);
                }

                else {
                    if (session.isValid()) {
                        callback.callbackWithParam(session.getRefreshToken());
                    }
                }
            });
        else
            callback.callbackWithParam(null);
    }

    refresh(): void {
        this.getCurrentUser().getSession(function (err, session) {
            if (err) {
                console.log("CognitoUtil: Can't set the credentials:" + err);
            }

            else {
                if (session.isValid()) {
                    console.log("CognitoUtil: refreshed successfully");
                } else {
                    console.log("CognitoUtil: refreshed but session is still not valid");
                }
            }
        });
    }
}