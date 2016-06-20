#!/usr/bin/env bash

PROJECT_NAME=budilov-workshop2
TABLE_NAME=WLoginTrail
ROLE_NAME_PREFIX=workshop23

# Create the bucket
aws s3 mb s3://$PROJECT_NAME/ --region us-east-1
# Add the ‘website’ configuration and bucket policy
aws s3 website s3://$PROJECT_NAME/ --index-document index.html --error-document index.html
cat s3-bucket-policy.json | sed 's/REPLACE_ME/'$PROJECT_NAME'/' > /tmp/s3-bucket-policy.json
aws s3api put-bucket-policy --bucket $PROJECT_NAME --policy file:///tmp/s3-bucket-policy.json

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
poolId=$(aws cognito-identity create-identity-pool --identity-pool-name $ROLE_NAME_PREFIXIdentityPool --allow-unauthenticated-identities --region us-east-1| grep IdentityPoolId | awk '{print $2}' | xargs |sed -e 's/^"//'  -e 's/"$//' -e 's/,$//')
# ------------------------------------- IAM
# Create an IAM role for unauthenticated users
cat unauthrole-trust-policy.json | sed 's/IDENTITY_POOL/'$poolId'/' > /tmp/unauthrole-trust-policy.json
aws iam create-role --role-name $ROLE_NAME_PREFIX-unauthenticated-role --assume-role-policy-document file:///tmp/unauthrole-trust-policy.json
aws iam put-role-policy --role-name $ROLE_NAME_PREFIX-unauthenticated-role --policy-name CognitoPolicy --policy-document file://unauthrole.json
# Create an IAM role for authenticated users
cat authrole-trust-policy.json | sed 's/IDENTITY_POOL/'$poolId'/' > /tmp/authrole-trust-policy.json
aws iam create-role --role-name $ROLE_NAME_PREFIX-authenticated-role --assume-role-policy-document file:///tmp/authrole-trust-policy.json
cat authrole.json | sed 's/TABLE_NAME/'$TABLE_NAME'/' > /tmp/authrole.json
aws iam put-role-policy --role-name $ROLE_NAME_PREFIX-unauthenticated-role --policy-name CognitoPolicy --policy-document file:///tmp/authrole.json

# Update cognito identity with the roles
aws cognito-identity set-identity-pool-roles --identity-pool-id $poolId --roles authenticated=arn:aws:iam:::role/$ROLE_NAME_PREFIX-authenticated-role,unauthenticated=arn:aws:iam:::role/$ROLE_NAME_PREFIX-unauthenticated-role --region us-east-1
# Create the user pool
aws cognito-idp create-user-pool --pool-name $PROJECT_NAME --policies PasswordPolicy={RequireLowercase=true,RequireNumbers=true,RequireSymbols=true,RequireUppercase=true,MinimumLength=8} --region us-east-1
