export namespace WebPushDTO {
  export type User = {
    id: string;
    name: string;
    nid: number;
    nickname: string;
    plans: {
      id: number;
      startTime: string;
      endTime: string;
      subject: string;
    }[];
    WebPushSubscription: {
      id: number;
      user_id: string;
      subscription_info: string;
    }[];
  };
}
