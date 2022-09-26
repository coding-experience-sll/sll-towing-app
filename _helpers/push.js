const OneSignal = require("@onesignal/node-onesignal");
const { ONESIGNAL_APP_ID, ONESIGNAL_API_KEY } = require("../config");
const app_key_provider = {
  getToken() {
    return ONESIGNAL_API_KEY;
  },
};
const configuration = OneSignal.createConfiguration({
  authMethods: {
    app_key: {
      tokenProvider: app_key_provider,
    },
  },
});
const client = new OneSignal.DefaultApi(configuration);

module.exports = { send };

async function send(playerIds, content, reportId) {
  //push notifications function. id storage is managed by front-end
  const notification = new OneSignal.Notification();
  notification.app_id = ONESIGNAL_APP_ID;
  notification.include_external_user_ids = playerIds;
  notification.small_icon = "ic_stat_onesignal_default";
  notification.contents = {
    en: content,
  };
  notification.data = {
    reportId: reportId,
  };

  const { id } = await client.createNotification(notification);

  return;
}
