import express from 'express';
import * as webPushService from '../service/planWebPushService';

const router = express.Router();

router.post('/', webPushService.addWebPushSchedule);

router.delete('/', webPushService.deleteWebPushSchedule);

export default router;
