$(document).ready(function () {
  const API_KEY = "OTBjMDRkY2QtMzdlMC00ZjMwLWIxMWMtZThiNjM0NjQ5YzBj";
  const API_SECRET = "NDg1MjMzMGItNTc5MS00ZDU4LTk1MGQtNmI4Mjc2NTBlY2Vm";

  if (typeof Napster === 'undefined') {
    $('body').html("There has been an error while loading Napster.js. Please check the console for errors.")
    return;
  }

  if (window.localStorage['napsterToken'] === undefined) {
    document.location = "https://api.rhapsody.com/oauth/authorize?response_type=code&redirect_uri=http://localhost/&client_id=" + API_KEY;
  }

  Napster.init({ consumerKey: API_KEY, isHTML5Compatible: true });

  // OAuth2 workflow:
  // Register "authorize" callback with provider, like /authorize
  // Hit https://api.rhapsody.com/oauth/authorize? { response_type: 'code', client_id: apiKey, redirect_uri: redirectUri }
  // Hook onBeforeRequest for /authorize
  //   POST to https://api.rhapsody.com/oauth/access_token
  //      form: {
  //        client_id: apiKey,
  //        client_secret: apiSecret,
  //        response_type: 'code',
  //        code: clientRequest.query.code,
  //        redirect_uri: redirectUri,
  //        grant_type: 'authorization_code'
  //      }
  // Napster /oauth/auccess_token respond with a JSON blob containing
  // { "accessToken": ..., "refreshToken": ... }
});
