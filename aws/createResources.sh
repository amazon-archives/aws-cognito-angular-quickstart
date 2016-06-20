#!/usr/bin/env bash

PROJECT_NAME=budilov-workshop2
# ------------------------------------- S3
# Create the bucket
aws s3 mb s3://$PROJECT_NAME/ --region us-east-1
# Add the ‘website’ configuration and bucket policy
aws s3 website s3://$PROJECT_NAME/ --index-document index.html --error-document index.html
cat s3-bucket-policy.json | sed 's/REPLACE_ME/'$PROJECT_NAME'/' > /tmp/s3-bucket-policy.json
aws s3api put-bucket-policy --bucket $PROJECT_NAME --policy file:///tmp/s3-bucket-policy.json

# ------------------------------------- DynamoDB
# Create DDB Table
aws dynamodb create-table \
    --table-name $PROJECT_NAME-LoginTrail \
    --attribute-definitions \
        AttributeName=userId,AttributeType=S \
        AttributeName=activityDate,AttributeType=S \
    --key-schema AttributeName=userId,KeyType=HASH AttributeName=activityDate,KeyType=RANGE \
    --provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1 \
    --region us-east-1

# ------------------------------------- IAM
# Create an IAM role for unauthenticated users
aws iam create-role --role-name $PROJECT_NAME-unauthenticated-role --assume-role-policy-document file://unauthrole.json --region us-east-1
# Create an IAM role for authenticated users
aws iam create-role --role-name $PROJECT_NAME-authenticated-role --assume-role-policy-document file://authrole.json --region us-east-1

# ------------------------------------- Cognito
# Create a Cognito Identity and Set roles
poolId=$(aws cognito-identity create-identity-pool --identity-pool-name $PROJECT_NAME --allow-unauthenticated-identities --region us-east-1| grep IdentityPoolId | awk '{print $2}' | xargs |sed -e 's/^"//'  -e 's/"$//' -e 's/,$//')
aws cognito-identity set-identity-pool-roles --identity-pool-id $poolId --roles authenticated=arn:aws:iam:::role/authenticated-role,unauthenticated=arn:aws:iam:::role/unauthenticated_role --region us-east-1
# Create the user pool
aws cognito-idp create-user-pool --pool-name $PROJECT_NAME --policies PasswordPolicy={RequireLowercase=true,RequireNumbers=true,RequireSymbols=true,RequireUppercase=true,MinimumLength=8} --region us-east-1
