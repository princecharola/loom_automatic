import { logger } from '../utils/logger.js';

export async function sendEmailNotification({ subject, message, recipients = [] }) {
  if (process.env.EMAIL_NOTIFICATIONS !== 'true') {
    return;
  }

  // Placeholder for SMTP provider integration.
  logger.info('Email notification dispatched', {
    subject,
    recipientsCount: recipients.length,
    message
  });
}

export async function sendPushNotificationHook(payload) {
  if (process.env.PUSH_HOOK_ENABLED !== 'true') {
    return;
  }

  logger.info('Push hook event triggered', payload);
}
