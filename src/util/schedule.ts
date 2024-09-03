import * as nodeSchedule from 'node-schedule';

export const makeSchedule = (
  hours: number,
  minutes: number,
  cb: () => void
) => {
  const rule = new nodeSchedule.RecurrenceRule();
  rule.tz = 'Asia/Seoul';
  rule.hour = hours;
  rule.minute = minutes;

  return nodeSchedule.scheduleJob(rule, cb);
};
