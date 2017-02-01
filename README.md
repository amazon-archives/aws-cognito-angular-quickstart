Cognito Quickstart
===================================================

# What does this app do?
![QuickStart Angular2 Cognito App](/aws/meta/Cognito-Angular2-QuickStart.png?raw=true)

# Tech Stack
## Required Tools
* [aws cli](http://docs.aws.amazon.com/cli/latest/userguide/installing.html)
* [eb cli](http://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3-install.html)
* [npm](https://www.npmjs.com/)
* [angular-cli](https://github.com/angular/angular-cli)

## Frameworks
* [AWS JavaScript SDK](http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/browser-intro.html)
* [AWS Rekognition](https://aws.amazon.com/rekognition/)
* [Angular 2](https://angular.io/docs/ts/latest/quickstart.html)
    * [TypeScript](https://www.typescriptlang.org/docs/tutorial.html)
* [Bootstrap](http://getbootstrap.com/)

# AWS Setup
##### Install the required tools
* Create an AWS account
* Install [npm](https://www.npmjs.com/)
* [Install or update your aws cli](http://docs.aws.amazon.com/cli/latest/userguide/installing.html) 
* [Install or update your eb cli](http://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3-install.html) 
* [Install angular-cli](https://github.com/angular/angular-cli)


# Getting the code
```
# Clone it from github
git clone --depth 1 git@github.com:awslabs/aws-cognito-angular2-quickstart.git
```
```
# Install the AWS resources and deploy your application to either Elastic Beanstalk or S3
cd aws
./createResources.sh
```

# Elastic Beanstalk
```
# Run the app in dev mode
npm install; npm run build; npm start
```
```
# Commit your changes and deploy it to your environment
git add .
git commit
eb deploy
```
```
# Test your deployed application
eb open
```

# S3
```
# Run the app in dev mode  
npm run startng
```
```
# Build the project and sync the output with the S3 bucket
npm run build; cd dist; aws s3 sync . s3://[BUCKET_NAME]/
```
```
# Test your deployed application
curl –I http://[BUCKET_NAME].s3-website-[REGION].amazonaws.com/
```
