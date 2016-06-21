#!/usr/bin/env bash

BUCKET_NAME=budilov-workshop6
TABLE_NAME=LoginTrail
ROLE_NAME_PREFIX=workshop6
POOL_NAME=workshop6

# Create the bucket
aws s3 mb s3://$BUCKET_NAME/ --region us-east-1
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
    --region us-east-1

# Create a Cognito Identity and Set roles
aws cognito-identity create-identity-pool --identity-pool-name WorkshopIdentityPool --allow-unauthenticated-identities --region us-east-1| grep IdentityPoolId | awk '{print $2}' | xargs |sed -e 's/^"//'  -e 's/"$//' -e 's/,$//' > /tmp/poolId
poolId=$(cat /tmp/poolId)
echo "Created an identity pool with id of " $poolId

# Create an IAM role for unauthenticated users
cat unauthrole-trust-policy.json | sed 's/IDENTITY_POOL/'$poolId'/' > /tmp/unauthrole-trust-policy.json
aws iam create-role --role-name $ROLE_NAME_PREFIX-unauthenticated-role --assume-role-policy-document file:///tmp/unauthrole-trust-policy.json
aws iam put-role-policy --role-name $ROLE_NAME_PREFIX-unauthenticated-role --policy-name CognitoPolicy --policy-document file://unauthrole.json

# Create an IAM role for authenticated users
cat authrole-trust-policy.json | sed 's/IDENTITY_POOL/'$poolId'/' > /tmp/authrole-trust-policy.json
aws iam create-role --role-name $ROLE_NAME_PREFIX-authenticated-role --assume-role-policy-document file:///tmp/authrole-trust-policy.json
cat authrole.json | sed 's/TABLE_NAME/'$TABLE_NAME'/' > /tmp/authrole.json
aws iam put-role-policy --role-name $ROLE_NAME_PREFIX-authenticated-role --policy-name CognitoPolicy --policy-document file:///tmp/authrole.json

# Update cognito identity with the roles
# If this command gives you an error, associate the roles manually
aws cognito-identity set-identity-pool-roles --identity-pool-id $poolId --roles authenticated=arn:aws:iam:::role/$ROLE_NAME_PREFIX-authenticated-role,unauthenticated=arn:aws:iam:::role/$ROLE_NAME_PREFIX-unauthenticated-role --region us-east-1
# Create the user pool
aws cognito-idp create-user-pool --pool-name $BUCKET_NAME --policies file://user-pool-policy.json --region us-east-1
