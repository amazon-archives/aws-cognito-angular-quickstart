#!/usr/bin/env bash

ROOT_NAME=budilovdelete
# Bucket name must be all lowercase, and start/end with lowecase letter or number
# $(echo...) code to work with versions of bash older than 4.0
BUCKET_NAME=budilov-$(echo "$ROOT_NAME" | tr '[:upper:]' '[:lower:]')
TABLE_NAME=LoginTrail$ROOT_NAME

ROLE_NAME_PREFIX=$ROOT_NAME
POOL_NAME=$ROOT_NAME
IDENTITY_POOL_NAME=$ROOT_NAME
REGION=us-west-2
EB_INSTANCE_TYPE=t2.small
EB_PLATFORM=node.js
CURR_DIR=$( cd $(dirname $0) ; pwd -P )
ROOT_DIR=$CURR_DIR/..

DDB_TABLE_ARN=""
IDENTITY_POOL_ID=""
USER_POOL_ID=""
USER_POOL_CLIENT_ID=""


createS3Bucket() {
    # Create the bucket
    aws s3 mb s3://$BUCKET_NAME/ --region $REGION
    # Add the ‘website’ configuration and bucket policy
    aws s3 website s3://$BUCKET_NAME/ --index-document index.html --error-document index.html
    cat s3-bucket-policy.json | sed 's/BUCKET_NAME/'$BUCKET_NAME'/' > /tmp/s3-bucket-policy.json
    aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy file:///tmp/s3-bucket-policy.json
    #Build the project and sync it up to the bucket
    ng build --prod ../
    aws s3 sync $ROOT_DIR/dist/ s3://$BUCKET_NAME/
}

createDDBTable() {
    # Create DDB Table
    aws dynamodb create-table \
        --table-name $TABLE_NAME \
        --attribute-definitions \
            AttributeName=userId,AttributeType=S \
            AttributeName=activityDate,AttributeType=S \
        --key-schema AttributeName=userId,KeyType=HASH AttributeName=activityDate,KeyType=RANGE \
        --provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1 \
        --region $REGION \
        > /tmp/dynamoTable

    DDB_TABLE_ARN=$(perl -nle 'print $& if m{"TableArn":\s*"\K([^"]*)}' /tmp/dynamoTable | awk -F'"' '{print $1}')
}

createCognitoResources() {
    # Create a Cognito Identity and Set roles
    aws cognito-identity create-identity-pool --identity-pool-name $IDENTITY_POOL_NAME --allow-unauthenticated-identities --region $REGION| grep IdentityPoolId | awk '{print $2}' | xargs |sed -e 's/^"//'  -e 's/"$//' -e 's/,$//' > /tmp/poolId
    IDENTITY_POOL_ID=$(cat /tmp/poolId)
    echo "Created an identity pool with id of " $IDENTITY_POOL_ID

    # Create an IAM role for unauthenticated users
    cat unauthrole-trust-policy.json | sed 's/IDENTITY_POOL/'$IDENTITY_POOL_ID'/' > /tmp/unauthrole-trust-policy.json
    aws iam create-role --role-name $ROLE_NAME_PREFIX-unauthenticated-role --assume-role-policy-document file:///tmp/unauthrole-trust-policy.json > /tmp/iamUnauthRole
    aws iam put-role-policy --role-name $ROLE_NAME_PREFIX-unauthenticated-role --policy-name CognitoPolicy --policy-document file://unauthrole.json

    # Create an IAM role for authenticated users
    cat authrole-trust-policy.json | sed 's/IDENTITY_POOL/'$IDENTITY_POOL_ID'/' > /tmp/authrole-trust-policy.json
    aws iam create-role --role-name $ROLE_NAME_PREFIX-authenticated-role --assume-role-policy-document file:///tmp/authrole-trust-policy.json > /tmp/iamAuthRole
    cat authrole.json | sed 's~DDB_TABLE_ARN~'$DDB_TABLE_ARN'~' > /tmp/authrole.json
    aws iam put-role-policy --role-name $ROLE_NAME_PREFIX-authenticated-role --policy-name CognitoPolicy --policy-document file:///tmp/authrole.json

    # Create the user pool
    aws cognito-idp create-user-pool --pool-name $POOL_NAME --auto-verified-attributes email --policies file://user-pool-policy.json --region $REGION > /tmp/$POOL_NAME-create-user-pool
    USER_POOL_ID=$(grep -E '"Id":' /tmp/$POOL_NAME-create-user-pool | awk -F'"' '{print $4}')
    echo "Created user pool with an id of " $USER_POOL_ID

    # Create the user pool client
    aws cognito-idp create-user-pool-client --user-pool-id $USER_POOL_ID --no-generate-secret --client-name webapp --region $REGION > /tmp/$POOL_NAME-create-user-pool-client
    USER_POOL_CLIENT_ID=$(grep -E '"ClientId":' /tmp/$POOL_NAME-create-user-pool-client | awk -F'"' '{print $4}')
    echo "Created user pool client with id of " $USER_POOL_CLIENT_ID

    # Add the user pool and user pool client id to the identity pool
    aws cognito-identity update-identity-pool --allow-unauthenticated-identities --identity-pool-id $IDENTITY_POOL_ID --identity-pool-name $IDENTITY_POOL_NAME --cognito-identity-providers ProviderName=cognito-idp.$REGION.amazonaws.com/$USER_POOL_ID,ClientId=$USER_POOL_CLIENT_ID --region $REGION

    # Update cognito identity with the roles
    UNAUTH_ROLE_ARN=$(perl -nle 'print $& if m{"Arn":\s*"\K([^"]*)}' /tmp/iamUnauthRole | awk -F'"' '{print $1}')
    AUTH_ROLE_ARN=$(perl -nle 'print $& if m{"Arn":\s*"\K([^"]*)}' /tmp/iamAuthRole | awk -F'"' '{print $1}')
    aws cognito-identity set-identity-pool-roles --identity-pool-id $IDENTITY_POOL_ID --roles authenticated=$AUTH_ROLE_ARN,unauthenticated=$UNAUTH_ROLE_ARN --region $REGION
}

createEBResources() {
    cd $ROOT_DIR
    sleep 1
    eb init $ROOT_NAME --region $REGION --platform $EB_PLATFORM
    sleep 1
    eb create $ROOT_NAME -d --region $REGION --platform $EB_PLATFORM --instance_type $EB_INSTANCE_TYPE
    cd $CURR_DIR
}

verifyEBCLI() {
    if command -v eb >/dev/null; then
        echo "Creating Elastic Beanstalk environment ..."
        createEBResources
    else
        echo "Please install the Elastic Beanstalk Command Line Interface first"
        exit 1;
    fi
}

writeConfigFiles() {
(
cat <<EOF
export const environment = {
    production: false,

    region: '$REGION',

    identityPoolId: '$IDENTITY_POOL_ID',
    userPoolId: '$USER_POOL_ID',
    clientId: '$USER_POOL_CLIENT_ID',

    rekognitionBucket: 'rekognition-pics',
    albumName: "usercontent",
    bucketRegion: '$REGION',

    ddbTableName: '$TABLE_NAME'
};

EOF
) > $ROOT_DIR/src/environments/environment.ts

(
cat <<EOF
export const environment = {
    production: true,

    region: '$REGION',

    identityPoolId: '$IDENTITY_POOL_ID',
    userPoolId: '$USER_POOL_ID',
    clientId: '$USER_POOL_CLIENT_ID',

    rekognitionBucket: 'rekognition-pics',
    albumName: "usercontent",
    bucketRegion: '$REGION',

    ddbTableName: '$TABLE_NAME'
};

EOF
) > $ROOT_DIR/src/environments/environment.prod.ts

cd $ROOT_DIR
git add .
git commit -m "Updated config files for created resources"
cd $CURR_DIR

}


PS3='Where would you like to deploy your application? '
options=("Elastic Beanstalk" "S3" "Quit")
select opt in "${options[@]}"
do

    createDDBTable
    createCognitoResources
    writeConfigFiles

    case $opt in
        "Elastic Beanstalk")
            verifyEBCLI
            break
            ;;
        "S3")
#            echo "you chose S3"
            createS3Bucket
            break
            ;;
        "Quit")
            break
            ;;
        *) echo invalid option;;
    esac
done


sleep 3
echo "Region: " $REGION
echo "DynamoDB: " $TABLE_NAME
echo "Bucket name: " + $BUCKET_NAME
echo "Identity Pool name: " $IDENTITY_POOL_NAME
echo "Identity Pool id: " $IDENTITY_POOL_ID





