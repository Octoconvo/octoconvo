import { pushBufferedNotifications } from "@/utils/notification";
import { NotificationGET } from "@/types/response";

const notifications: NotificationGET[] = [
  {
    id: "1",
    triggeredFor: {
      username: "testnotification1",
    },
    triggeredForId: "testnotification1",
    triggeredBy: {
      username: "testnotification1",
    },
    triggeredById: "testnotification1",
    isRead: false,
    status: "PENDING",
    type: "COMMUNITYREQUEST",
    community: {
      name: "tetnotification1",
    },
    communityId: "testnotification1",
    createdAt: "testnotification1",
    payload: " testnotification1",
  },
  {
    id: "2",
    triggeredFor: {
      username: "testnotification1",
    },
    triggeredForId: "testnotification1",
    triggeredBy: {
      username: "testnotification1",
    },
    triggeredById: "testnotification1",
    isRead: false,
    status: "PENDING",
    type: "REQUESTUPDATE",
    community: null,
    communityId: null,
    createdAt: "testnotification1",
    payload: " testnotification1",
  },
  {
    id: "3",
    triggeredFor: {
      username: "testnotification1",
    },
    triggeredForId: "testnotification1",
    triggeredBy: {
      username: "testnotification1",
    },
    triggeredById: "testnotification1",
    isRead: false,
    status: "PENDING",
    type: "REQUESTUPDATE",
    community: null,
    communityId: null,
    createdAt: "testnotification1",
    payload: " testnotification1",
  },
];
test("Test pushBufferedNotifications", () => {
  const bufferedNotifications = [{ ...notifications[0], isRead: true }];

  const updatedNotifications = pushBufferedNotifications({
    notifications,
    bufferedNotifications,
  });

  expect(updatedNotifications[0]).toBe(bufferedNotifications[0]);
  expect(updatedNotifications[2]).toBe(notifications[2]);
  expect(updatedNotifications[3]).toBe(notifications[3]);
});
