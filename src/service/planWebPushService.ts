import { NextFunction, Request, Response } from 'express';
import * as nodeSchedule from 'node-schedule';
import { WebPushDTO } from '../types/WebPushDTO';
import * as webPush from 'web-push';
import { notify } from '../util/webPush';
import { makeSchedule } from '../util/schedule';

// 메모리에 저장되는데 create, update, delete 작업은 해당 유저 id 를 기준으로
// 수정이 일어나면 전체를 다시 저장, 즉 특정 계획이 삭제되더라도 기존 작업을 종료 시킨후 다시 계획 리스트를 등록
// 계획 하나하나에 대해 수정을 해주면 너무 복잡해짐.
let webPushSchedules: {
  [userId: string]: {
    planId: number;
    scheduleJob: nodeSchedule.Job;
  }[];
} = {};
/**
 * 유저 계획 리스트를 돌며 start, end 타임을 가져옴
 * 스케줄에 시작 시간만 웹 푸시 등록함
 * 웹 푸시 정보는 유저 webPushSubscription에 있는데 여러개가 있을 수도 있음.
 */
export const initWebPushSchedules = async () => {
  let res: WebPushDTO.User[] = [];
  try {
    res = await fetch('http://localhost:3000/api/web-push', {
      method: 'get',
    }).then((res) => res.json());
  } catch (e) {
    console.error(e);
  }

  webPush.setVapidDetails(
    process.env.WEB_PUSH_MAIL!,
    process.env.WEB_PUSH_PUBLIC_KEY!,
    process.env.WEB_PUSH_PRIVATE_KEY!
  );

  res.forEach((user) => {
    user.plans.forEach((plan) => {
      const startTime = plan.startTime
        .split('T')[1]
        .replace(':00.000Z', '')
        .split(':')
        .map(Number);
      const endTime = plan.endTime
        .split('T')[1]
        .replace(':00.000Z', '')
        .split(':')
        .map(Number);

      const job = makeSchedule(startTime[0], startTime[1], () => {
        user.WebPushSubscription.forEach((subscription) => {
          notify(subscription.subscription_info, {
            message: `"${plan.subject}"을(를) 시작하실 시간입니다!`,
          });
        });
      });

      if (webPushSchedules[user.id]) {
        webPushSchedules[user.id].push({
          scheduleJob: job,
          planId: plan.id,
        });
      } else {
        webPushSchedules[user.id] = [
          {
            scheduleJob: job,
            planId: plan.id,
          },
        ];
      }
    });
  });
};

export const addWebPushSchedule = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user: WebPushDTO.User = req.body;

  // 기존 스케줄 제거 후
  deleteSchedule(user.id);

  user.plans.forEach((plan) => {
    const startTime = plan.startTime
      .split('T')[1]
      .replace(':00.000Z', '')
      .split(':')
      .map(Number);
    const endTime = plan.endTime
      .split('T')[1]
      .replace(':00.000Z', '')
      .split(':')
      .map(Number);

    const job = makeSchedule(startTime[0], startTime[1], () => {
      user.WebPushSubscription.forEach((subscription) => {
        notify(subscription.subscription_info, {
          message: `"${plan.subject}"을(를) 시작하실 시간입니다!`,
        });
      });
    });

    if (webPushSchedules[user.id]) {
      webPushSchedules[user.id].push({
        scheduleJob: job,
        planId: plan.id,
      });
    } else {
      webPushSchedules[user.id] = [
        {
          scheduleJob: job,
          planId: plan.id,
        },
      ];
    }
  });
};

export const deleteWebPushSchedule = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user: Pick<WebPushDTO.User, 'id'> = req.body;

  deleteSchedule(user.id);
};

const deleteSchedule = (userId: string) => {
  if (webPushSchedules[userId]) {
    webPushSchedules[userId].forEach((schedule) => {
      schedule.scheduleJob.cancel();
    });
    webPushSchedules[userId] = [];
  }
};
