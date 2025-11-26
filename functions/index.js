const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");

admin.initializeApp();

// Yeni bildirim oluşturulduğunda push notification gönder
exports.sendNotificationOnCreate = onDocumentCreated(
    "notifications/{notificationId}",
    async (event) => {
      const notification = event.data.data();
      const userId = notification.userId;

      console.log("Yeni bildirim:", notification);

      if (!userId) {
        console.log("userId yok, atlanıyor");
        return null;
      }

      try {
        // Kullanıcının FCM token'ını al
        const userDoc = await admin.firestore()
            .collection("users")
            .doc(userId)
            .get();

        if (!userDoc.exists) {
          console.log("Kullanıcı bulunamadı:", userId);
          return null;
        }

        const userData = userDoc.data();
        const fcmToken = userData.fcmToken;
        const notificationsEnabled = userData.notificationsEnabled;

        if (!notificationsEnabled || !fcmToken) {
          console.log("Bildirimler kapalı veya token yok:", userId);
          return null;
        }

        // Push notification mesajını hazırla
        const message = {
          notification: {
            title: notification.title || "Yeni Bildirim",
            body: notification.message || "",
          },
          data: {
            type: notification.type || "general",
            notificationId: event.params.notificationId,
            url: "/notifications",
          },
          token: fcmToken,
        };

        // Bildirimi gönder
        const response = await admin.messaging().send(message);
        console.log("Bildirim gönderildi:", response);

        return response;
      } catch (error) {
        console.error("Push notification hatası:", error);
        return null;
      }
    });

// Yeni görev oluşturulduğunda bildirim gönder
exports.sendNotificationOnTaskCreate = onDocumentCreated(
    "tasks/{taskId}",
    async (event) => {
      const task = event.data.data();
      const assignedTo = task.assignedTo;

      console.log("Yeni görev:", task);

      if (!assignedTo) {
        console.log("assignedTo yok, atlanıyor");
        return null;
      }

      try {
        const userDoc = await admin.firestore()
            .collection("users")
            .doc(assignedTo)
            .get();

        if (!userDoc.exists) {
          console.log("Kullanıcı bulunamadı:", assignedTo);
          return null;
        }

        const userData = userDoc.data();
        const fcmToken = userData.fcmToken;
        const notificationsEnabled = userData.notificationsEnabled;

        if (!notificationsEnabled || !fcmToken) {
          console.log("Bildirimler kapalı:", assignedTo);
          return null;
        }

        const message = {
          notification: {
            title: "Yeni Görev Atandı",
            body: task.title,
          },
          data: {
            type: "task",
            taskId: event.params.taskId,
            url: "/tasks",
          },
          token: fcmToken,
        };

        const response = await admin.messaging().send(message);
        console.log("Görev bildirimi gönderildi:", response);

        return response;
      } catch (error) {
        console.error("Görev bildirimi hatası:", error);
        return null;
      }
    });

// Yeni duyuru oluşturulduğunda tüm kullanıcılara bildirim gönder
exports.sendNotificationOnAnnouncementCreate = onDocumentCreated(
    "announcements/{announcementId}",
    async (event) => {
      const announcement = event.data.data();

      console.log("Yeni duyuru:", announcement);

      try {
        // Bildirimleri açık olan tüm kullanıcıları al
        const usersSnapshot = await admin.firestore()
            .collection("users")
            .where("notificationsEnabled", "==", true)
            .get();

        if (usersSnapshot.empty) {
          console.log("Bildirim açık kullanıcı yok");
          return null;
        }

        // Tüm kullanıcılara bildirim gönder
        const promises = [];
        usersSnapshot.forEach((doc) => {
          const userData = doc.data();
          if (userData.fcmToken) {
            const message = {
              notification: {
                title: "Yeni Duyuru",
                body: announcement.title,
              },
              data: {
                type: "announcement",
                announcementId: event.params.announcementId,
                url: "/announcements",
              },
              token: userData.fcmToken,
            };

            promises.push(
                admin.messaging().send(message)
                    .then((response) => {
                      console.log("Duyuru gönderildi:", doc.id);
                      return response;
                    })
                    .catch((error) => {
                      console.error("Duyuru gönderim hatası:", doc.id, error);
                      return null;
                    }),
            );
          }
        });

        await Promise.all(promises);
        console.log(`${promises.length} kullanıcıya duyuru gönderildi`);

        return null;
      } catch (error) {
        console.error("Duyuru bildirimi hatası:", error);
        return null;
      }
    });
