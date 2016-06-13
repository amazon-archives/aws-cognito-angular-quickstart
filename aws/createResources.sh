#!/usr/bin/env bash

# ------------------------------------- S3
# Create the bucket
aws s3 mb s3://budilov-cognito/ --region us-east-1
# Add the ‘website’ configuration and bucket policy
aws s3 website s3://budilov-cognito/ --index-document index.html --error-document index.html
aws s3api put-bucket-policy --bucket budilov-cognito --policy file://s3-bucket-policy.json

# ------------------------------------- DynamoDB
# Create DDB Table
aws dynamodb create-table \
    --table-name LoginTrail \
    --attribute-definitions \
        AttributeName=userId,AttributeType=S \
        AttributeName=activityDate,AttributeType=S \
    --key-schema AttributeName=userId,KeyType=HASH AttributeName=activityDate,KeyType=RANGE \
    --provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1 \
    --region us-east-1

# ------------------------------------- IAM
# Create an IAM role for unauthenticated users
aws iam create-role --role-name unauthenticated-role --assume-role-policy-document file://unauthrole.json --region us-east-1
# Create an IAM role for authenticated users
aws iam create-role --role-name authenticated-role --assume-role-policy-document file://authrole.json --region us-east-1

# ------------------------------------- Cognito
# Create a Cognito Identity and Set roles
aws cognito-identity create-identity-pool --identity-pool-name angular2sample --allow-unauthenticated-identities
aws cognito-identity set-identity-pool-roles --identity-pool-id us-east-1:a70dbbfa-5513-4cc7-857e-963cb1f4eb3f --roles authenticated=arn:aws:iam:::role/authenticated-role,unauthenticated=arn:aws:iam:::role/unauthenticated_role --region us-east-1
# Create the user pool
aws cognito-user-pool create-user-pool --pool-name angular2sample --policies PasswordPolicy={MinimumLength=integer,RequireUppercase=boolean,RequireLowercase=boolean,RequireNumbers=boolean,RequireSymbols=boolean} --region us-east-1
