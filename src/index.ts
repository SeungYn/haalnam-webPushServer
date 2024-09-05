import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import { initWebPushSchedules } from './service/planWebPushService';
import planWebPushRouter from './router/planWebPushRouter';
import { initExpiredSubscriptionProcessSchedule } from './util/webPush';

dotenv.config();

const app = express();

app.use(express.json());

app.use('/schedule', planWebPushRouter);

app.use((req, res, next) => {
  res.status(404).json({ message: '라우터가 존재하지 않습니다.' });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.log('----에러 발생---', new Date());
  console.error(err);
  res.status(500).json({ message: '에러가 발생했습니다.' });
});

const server = app.listen(4000, async () => {
  console.log('express start');
  await initWebPushSchedules();
  initExpiredSubscriptionProcessSchedule();
});
