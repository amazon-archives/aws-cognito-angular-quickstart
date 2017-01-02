// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `angular-cli.json`.

export const environment = {
  production: false,

  region: 'us-east-1',

  identityPoolId: 'us-east-1:add56d6e-da5d-4b07-99c9-93aea9dd48b6',
  userPoolId: 'us-east-1_MVqGUM4CY',
  clientId: '6f3ekq1npds2g150fcojn4neq',

  ddbTableName: 'LoginTrailangular2quickstart'
};
