/**
 * Firebase Cloud Functions - Push Notification Gönderme
 * 
 * NOT: Bu dosya Firebase Cloud Functions için hazırlanmıştır.
 * Deploy etmek için:
 * 1. Firebase CLI yükleyin: npm install -g firebase-tools
 * 2. firebase init functions
 * 3. Bu kodu functions/index.js dosyasına kopyalayın
 * 4. firebase deploy --only functions
 * 
 * Alternatif: Vercel'de API route olarak da kullanılabilir (api/send-notification.js)
 */

const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

/**
 * Kullanıcıya push notification gönder
 */
async function sendPushToUser(userId, title, body, data = {}) {
  try {
    // Kullanıcının FCM token'ını al
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      console.log('Kullanıcı bulunamadı:', userId);
      return { success: false, error: 'Kullanıcı bulunamadı' };
    }

    const userData = userDoc.data();
    const fcmToken = userData.fcmToken;
    const notificationsEnabled = userData.notificationsEnabled;

    // Bildirimler kapalıysa gönderme
    if (!notificationsEnabled || !fcmToken) {
      console.log('Bildirimler kapalı veya token yok:', userId);
      return { success: false, error: 'Bildirimler kapalı' };
    }

    // Mesajı hazırla
    const message = {
      notification: {
        title: title,
        body: body,
      },
      data: data,
      token: fcmToken,
    };

    // Bildirimi gönder
    const response = await admin.messaging().send(message);
    console.log('Bildirim gönderildi:', response);

    return { success: true, messageId: response };
  } catch (error) {
    console.error('Push notification gönderme hatası:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Departmandaki tüm kullanıcılara push notification gönder
 */
async function sendPushToDepartment(department, title, body, data = {}) {
  try {
    // Departmandaki kullanıcıları bul
    const usersSnapshot = await db.collection('users')
      .where('department', '==', department)
      .where('notificationsEnabled', '==', true)
      .get();

    if (usersSnapshot.empty) {
      console.log('Departmanda bildirim açık kullanıcı yok:', department);
      return { success: true, sentCount: 0 };
    }

    // Tüm kullanıcılara gönder
    const promises = [];
    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      if (userData.fcmToken) {
        promises.push(sendPushToUser(doc.id, title, body, data));
      }
    });

    const results = await Promise.all(promises);
    const sentCount = results.filter(r => r.success).length;

    console.log(`${sentCount} kullanıcıya bildirim gönderildi`);
    return { success: true, sentCount };
  } catch (error) {
    console.error('Departmana push notification gönderme hatası:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Yeni görev eklendiğinde bildirim gönder
 */
exports.onTaskCreated = admin.firestore.document('tasks/{taskId}')
  .onCreate(async (snap, context) => {
    const task = snap.data();
    const taskId = context.params.taskId;

    // Görev sahibine bildirim gönder
    if (task.assignedTo) {
      await sendPushToUser(
        task.assignedTo,
        'Yeni Görev Atandı',
        `${task.title} görevi size atandı`,
        {
          type: 'task',
          taskId: taskId,
          url: `/tasks?taskId=${taskId}`
        }
      );
    }

    // Departmandaki diğer kullanıcılara da bildir
    if (task.department) {
      await sendPushToDepartment(
        task.department,
        'Yeni Görev',
        `${task.department} departmanına yeni görev eklendi: ${task.title}`,
        {
          type: 'task',
          taskId: taskId,
          url: `/tasks?taskId=${taskId}`
        }
      );
    }
  });

/**
 * Yeni mesaj geldiğinde bildirim gönder
 */
exports.onMessageCreated = admin.firestore.document('conversations/{conversationId}/messages/{messageId}')
  .onCreate(async (snap, context) => {
    const message = snap.data();
    const conversationId = context.params.conversationId;

    // Karşı taraftaki kullanıcıya bildirim gönder
    if (message.receiverId) {
      const senderDoc = await db.collection('users').doc(message.senderId).get();
      const senderName = senderDoc.exists ? senderDoc.data().fullName : 'Bir kullanıcı';

      await sendPushToUser(
        message.receiverId,
        `Yeni Mesaj - ${senderName}`,
        message.text,
        {
          type: 'message',
          conversationId: conversationId,
          url: `/messages?conversationId=${conversationId}`
        }
      );
    }
  });

/**
 * Yeni duyuru eklendiğinde bildirim gönder
 */
exports.onAnnouncementCreated = admin.firestore.document('announcements/{announcementId}')
  .onCreate(async (snap, context) => {
    const announcement = snap.data();
    const announcementId = context.params.announcementId;

    // Tüm departmanlara veya belirli departmana gönder
    if (announcement.targetDepartments && announcement.targetDepartments.length > 0) {
      for (const dept of announcement.targetDepartments) {
        await sendPushToDepartment(
          dept,
          'Yeni Duyuru',
          announcement.title,
          {
            type: 'announcement',
            announcementId: announcementId,
            url: `/announcements?announcementId=${announcementId}`
          }
        );
      }
    }
  });

/**
 * Manuel bildirim gönderme endpoint'i (HTTP callable function)
 */
exports.sendCustomNotification = admin.https.onCall(async (data, context) => {
  // Sadece authenticated kullanıcılar çağırabilir
  if (!context.auth) {
    throw new admin.https.HttpsError('unauthenticated', 'Oturum açılmamış');
  }

  const { userId, title, body, customData } = data;

  if (!userId || !title || !body) {
    throw new admin.https.HttpsError('invalid-argument', 'userId, title ve body gerekli');
  }

  const result = await sendPushToUser(userId, title, body, customData);

  if (!result.success) {
    throw new admin.https.HttpsError('internal', result.error);
  }

  return result;
});

module.exports = {
  sendPushToUser,
  sendPushToDepartment
};
