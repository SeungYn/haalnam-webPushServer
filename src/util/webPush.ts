import * as webPush from 'web-push';
import * as nodeSchedule from 'node-schedule';
import * as webPushService from '../service/planWebPushService';

const expiredSubscriptions = new Set();

export const notify = async (subscription_info: any, data: any) => {
  webPush.setVapidDetails(
    process.env.WEB_PUSH_MAIL!,
    process.env.WEB_PUSH_PUBLIC_KEY!,
    process.env.WEB_PUSH_PRIVATE_KEY!
  );

  return webPush
    .sendNotification(JSON.parse(subscription_info), JSON.stringify(data))
    .catch((e) => {
      if (e instanceof webPush.WebPushError) {
        console.log('eee');
        if (e.statusCode === 410) {
          expiredSubscriptions.add(e.endpoint);
        }
      }
    });
};

// 만료된 구독 정보는 1시간에 한 번씩 처리
// 이후 만료된 구독의 사용자는 다시 최신화로 스케줄 등록해야함.
export const initExpiredSubscriptionProcessSchedule = async () => {
  console.log('만료된 구족정보 스케쥴링 시작!');

  // 초기화해줄 때는 10초 쉼 모든 구독정보과 완료될 때까지 기달
  await new Promise((res, rej) => setTimeout(() => res(1), 10000));
  const rule = new nodeSchedule.RecurrenceRule();
  rule.tz = 'Asia/Seoul';
  rule.minute = 0;

  const schedule = nodeSchedule.scheduleJob(rule, () => {
    console.log(
      '만료된 구독 스케줄링이 시작됨 제거될 구독 수: ',
      expiredSubscriptions.size
    );
    if (expiredSubscriptions.size === 0) return;

    const headers = new Headers();
    headers.set('token', process.env.SCHEDULE_SERVER_TOKEN!);
    // JSON으로 변경할 떄는 유사 배열은 사용하면 에러 발생함.
    fetch('http://localhost:3000/api/web-push', {
      method: 'delete',
      headers,
      body: JSON.stringify({
        endPoints: [...expiredSubscriptions.values()],
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        // 스케줄링 업데이트
        webPushService.updateWebPushSchedule(res);
        // 셋 초기화
        expiredSubscriptions.clear();
      })
      .catch((e) => {
        console.log(e);
      });
  });

  schedule.invoke();
};
