import * as webPush from 'web-push';

export const notify = (subscription_info: any, data: any) => {
  webPush.setVapidDetails(
    process.env.WEB_PUSH_MAIL!,
    process.env.WEB_PUSH_PUBLIC_KEY!,
    process.env.WEB_PUSH_PRIVATE_KEY!
  );

  webPush.sendNotification(JSON.parse(subscription_info), JSON.stringify(data));
};
