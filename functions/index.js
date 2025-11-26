const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");

admin.initializeApp();

// Yeni bildirim oluşturulduğunda push notification gönder
// NOT: Görev ve duyurular zaten kendi function'larında işlendiği için
// sadece diğer tip bildirimleri gönder
exports.sendNotificationOnCreate = onDocumentCreated(
    "notifications/{notificationId}",
    async (event) => {
      const notification = event.data.data();
      const userId = notification.userId;
      const type = notification.type;

      console.log("Yeni bildirim:", notification);

      // Görev ve duyuru bildirimleri zaten ayrı function'larda işlendiği için atla
      if (type === "task" || type === "announcement") {
        console.log("Bu tip bildirim ayrı function'da işleniyor:", type);
        return null;
      }

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

// Yeni görev oluşturulduğunda ilgili departmandaki kullanıcılara bildirim gönder
exports.sendNotificationOnTaskCreate = onDocumentCreated(
    "tasks/{taskId}",
    async (event) => {
      const task = event.data.data();
      const relatedDepartment = task.relatedDepartment;
      const createdBy = task.createdBy || "Bilinmeyen";

      console.log("Yeni görev:", task);

      if (!relatedDepartment) {
        console.log("relatedDepartment yok, atlanıyor");
        return null;
      }

      try {
        // İlgili departmandaki bildirimleri açık olan kullanıcıları al
        const usersSnapshot = await admin.firestore()
            .collection("users")
            .where("department", "==", relatedDepartment)
            .where("notificationsEnabled", "==", true)
            .get();

        if (usersSnapshot.empty) {
          console.log("İlgili departmanda bildirim açık kullanıcı yok:",
              relatedDepartment);
          return null;
        }

        // Tüm kullanıcılara bildirim gönder
        const promises = [];
        usersSnapshot.forEach((doc) => {
          const userData = doc.data();
          if (userData.fcmToken) {
            const message = {
              notification: {
                title: "Yeni Görev",
                body: `${createdBy} - ${task.title}`,
              },
              data: {
                type: "task",
                taskId: event.params.taskId,
                url: "/job-tracking",
              },
              token: userData.fcmToken,
            };

            promises.push(
                admin.messaging().send(message)
                    .then((response) => {
                      console.log("Görev bildirimi gönderildi:", doc.id);
                      return response;
                    })
                    .catch((error) => {
                      console.error("Görev bildirim hatası:", doc.id, error);
                      return null;
                    }),
            );
          }
        });

        await Promise.all(promises);
        console.log(`${promises.length} kullanıcıya görev bildirimi gönderildi`);

        return null;
      } catch (error) {
        console.error("Görev bildirimi hatası:", error);
        return null;
      }
    });

// Yeni mesaj oluşturulduğunda alıcıya bildirim gönder
exports.sendNotificationOnMessageCreate = onDocumentCreated(
    "messages/{messageId}",
    async (event) => {
      const message = event.data.data();
      const recipientId = message.recipientId;
      const senderId = message.senderId;

      console.log("Yeni mesaj:", message);

      if (!recipientId || !senderId) {
        console.log("recipientId veya senderId yok, atlanıyor");
        return null;
      }

      try {
        // Gönderen kişinin adını al
        const senderDoc = await admin.firestore()
            .collection("users")
            .doc(senderId)
            .get();

        const senderName = senderDoc.exists ?
          senderDoc.data().fullName || "Bir kullanıcı" :
          "Bir kullanıcı";

        // Alıcının FCM token'ını al
        const recipientDoc = await admin.firestore()
            .collection("users")
            .doc(recipientId)
            .get();

        if (!recipientDoc.exists) {
          console.log("Alıcı bulunamadı:", recipientId);
          return null;
        }

        const recipientData = recipientDoc.data();
        const fcmToken = recipientData.fcmToken;
        const notificationsEnabled = recipientData.notificationsEnabled;

        if (!notificationsEnabled || !fcmToken) {
          console.log("Alıcının bildirimleri kapalı:", recipientId);
          return null;
        }

        const pushMessage = {
          notification: {
            title: `Yeni Mesaj - ${senderName}`,
            body: message.text || "Yeni bir mesajınız var",
          },
          data: {
            type: "message",
            messageId: event.params.messageId,
            senderId: senderId,
            url: "/messages",
          },
          token: fcmToken,
        };

        const response = await admin.messaging().send(pushMessage);
        console.log("Mesaj bildirimi gönderildi:", response);

        return response;
      } catch (error) {
        console.error("Mesaj bildirimi hatası:", error);
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
