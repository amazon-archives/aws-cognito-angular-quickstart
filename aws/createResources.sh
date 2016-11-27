#!/usr/bin/env bash

ROOT_NAME=DevDay2
# Bucket name must be all lowercase, and start/end with lowecase letter or number
# $(echo...) code to work with versions of bash older than 4.0
BUCKET_NAME=budilov-$(echo "$ROOT_NAME" | tr '[:upper:]' '[:lower:]')
TABLE_NAME=LoginTrail$ROOT_NAME
# Replace with your 12-digit AWS account ID (e.g., 123456789012)
AWS_ACCOUNT=account-id
ROLE_NAME_PREFIX=$ROOT_NAME
POOL_NAME=$ROOT_NAME
IDENTITY_POOL_NAME=$ROOT_NAME
REGION=us-east-1

# Create the bucket
aws s3 mb s3://$BUCKET_NAME/ --region $REGION
# Add the ‘website’ configuration and bucket policy
aws s3 website s3://$BUCKET_NAME/ --index-document index.html --error-document index.html
cat s3-bucket-policy.json | sed 's/REPLACE_ME/'$BUCKET_NAME'/' > /tmp/s3-bucket-policy.json
aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy file:///tmp/s3-bucket-policy.json

# Create DDB Table
aws dynamodb create-table \
    --table-name $TABLE_NAME \
    --attribute-definitions \
        AttributeName=userId,AttributeType=S \
        AttributeName=activityDate,AttributeType=S \
    --key-schema AttributeName=userId,KeyType=HASH AttributeName=activityDate,KeyType=RANGE \
    --provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1 \
    --region $REGION


# Create a Cognito Identity and Set roles
aws cognito-identity create-identity-pool --identity-pool-name $IDENTITY_POOL_NAME --allow-unauthenticated-identities --region $REGION| grep IdentityPoolId | awk '{print $2}' | xargs |sed -e 's/^"//'  -e 's/"$//' -e 's/,$//' > /tmp/poolId
identityPoolId=$(cat /tmp/poolId)
echo "Created an identity pool with id of " $identityPoolId

# Create an IAM role for unauthenticated users
cat unauthrole-trust-policy.json | sed 's/IDENTITY_POOL/'$identityPoolId'/' > /tmp/unauthrole-trust-policy.json
aws iam create-role --role-name $ROLE_NAME_PREFIX-unauthenticated-role --assume-role-policy-document file:///tmp/unauthrole-trust-policy.json
aws iam put-role-policy --role-name $ROLE_NAME_PREFIX-unauthenticated-role --policy-name CognitoPolicy --policy-document file://unauthrole.json

# Create an IAM role for authenticated users
cat authrole-trust-policy.json | sed 's/IDENTITY_POOL/'$identityPoolId'/' > /tmp/authrole-trust-policy.json
aws iam create-role --role-name $ROLE_NAME_PREFIX-authenticated-role --assume-role-policy-document file:///tmp/authrole-trust-policy.json
cat authrole.json | sed 's/TABLE_NAME/'$TABLE_NAME'/' > /tmp/authrole.json
aws iam put-role-policy --role-name $ROLE_NAME_PREFIX-authenticated-role --policy-name CognitoPolicy --policy-document file:///tmp/authrole.json

# Create the user pool
aws cognito-idp create-user-pool --pool-name $POOL_NAME --auto-verified-attributes email --policies file://user-pool-policy.json --region $REGION > /tmp/$POOL_NAME-create-user-pool
userPoolId=$(grep -Po '"Id":.*?[^\\]".*' /tmp/$POOL_NAME-create-user-pool | awk -F'"' '{print $4}')
echo "Created user pool with an id of " $userPoolId

# Create the user pool client
aws cognito-idp create-user-pool-client --user-pool-id $userPoolId --no-generate-secret --client-name webapp --region $REGION > /tmp/$POOL_NAME-create-user-pool-client
userPoolClientId=$(grep -Po '"ClientId":.*?[^\\]".*' /tmp/$POOL_NAME-create-user-pool-client | awk -F'"' '{print $4}')
echo "Created user pool client with id of " $userPoolClientId

# Add the user pool and user pool client id to the identity pool
aws cognito-identity update-identity-pool --allow-unauthenticated-identities --identity-pool-id $identityPoolId --identity-pool-name $IDENTITY_POOL_NAME --cognito-identity-providers ProviderName=cognito-idp.$REGION.amazonaws.com/$userPoolId,ClientId=$userPoolClientId --region $REGION

# Update cognito identity with the roles
# If this command gives you an error, associate the roles manually
aws cognito-identity set-identity-pool-roles --identity-pool-id $identityPoolId --roles authenticated=arn:aws:iam::$AWS_ACCOUNT:role/$ROLE_NAME_PREFIX-authenticated-role,unauthenticated=arn:aws:iam::$AWS_ACCOUNT:role/$ROLE_NAME_PREFIX-unauthenticated-role --region $REGION

sleep 3
echo "Region: " $REGION
echo "DynamoDB: " $TABLE_NAME
echo "Identity Pool name: " $IDENTITY_POOL_NAME
echo "Identity Pool id: " $identityPoolId
