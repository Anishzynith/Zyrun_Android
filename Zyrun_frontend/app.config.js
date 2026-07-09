require("dotenv").config();

module.exports = ({ config }) => ({
  ...config,

  extra: {
    ...config.extra,

    googleClientId:
      process.env.GOOGLE_OAUTH_WEB_CLIENT_ID ||
      config.extra?.googleClientId,

    googleWebClientId:
      process.env.GOOGLE_OAUTH_WEB_CLIENT_ID ||
      config.extra?.googleWebClientId,

    googleAndroidClientId:
      process.env.GOOGLE_OAUTH_ANDROID_CLIENT_ID ||
      process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ||
      config.extra?.googleAndroidClientId,

    googleClientSecret:
      process.env.GOOGLE_OAUTH_SECRET ||
      config.extra?.googleClientSecret,

    apiUrl:
      process.env.API_URL ||
      config.extra?.apiUrl,
  },
});