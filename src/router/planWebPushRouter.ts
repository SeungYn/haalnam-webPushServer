import express from 'express';
import * as webPushService from '../service/planWebPushService';
import { WebPushDTO } from '../types/WebPushDTO';

const router = express.Router();

router.post('/', (req, res, next) => {
  const users: WebPushDTO.User[] = req.body;
  webPushService.updateWebPushSchedule(users);

  return res.status(204).end();
});

router.delete('/', (req, res, next) => {
  const user: Pick<WebPushDTO.User, 'id'> = req.body;
  webPushService.deleteWebPushSchedule(user);

  return res.status(204).end();
});

export default router;
