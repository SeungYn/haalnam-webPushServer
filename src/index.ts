import dotenv from 'dotenv';
import express from 'express';
import { initWebPushSchedules } from './service/planWebPushService';
import planWebPushRouter from './router/planWebPushRouter';

dotenv.config();

const app = express();

app.use(express.json());

app.use('/schedule', planWebPushRouter);

app.listen(4000, () => {
  console.log('express start');
  initWebPushSchedules();
});
