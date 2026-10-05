import { normalizeIndianPhone } from './phone';

/**
 * Free "click-to-chat" WhatsApp helpers.
 *
 * These do NOT send anything automatically. They open WhatsApp (app or web)
 * on the receptionist's device with the message pre-filled; staff taps Send.
 * No WhatsApp Business API number is required, so there is no cost and no
 * risk of the number being banned. When an API provider is added later,
 * the automated path lives in backend/utils/send_whatsapp.js.
 */

const getClinicName = () => localStorage.getItem('clinicName') || 'our clinic';

/**
 * Builds a wa.me link for an Indian mobile number.
 * @returns {string|null} null when the phone number is invalid
 */
export function buildWhatsAppLink(rawPhone, message) {
  const { isValid, normalized } = normalizeIndianPhone(rawPhone);
  if (!isValid) return null;
  return `https://wa.me/91${normalized}?text=${encodeURIComponent(message)}`;
}

/**
 * Opens WhatsApp with a pre-filled message.
 * @returns {boolean} false when the phone number is invalid
 */
export function openWhatsApp(rawPhone, message) {
  const link = buildWhatsAppLink(rawPhone, message);
  if (!link) return false;
  window.open(link, '_blank', 'noopener,noreferrer');
  return true;
}

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric'
  });

const formatTime = (date) =>
  new Date(date).toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit'
  });

/** Live queue token message with the patient's tracking link. */
export function tokenMessage({ patientName, tokenNumber, doctorName, trackingLink }) {
  return [
    `Namaste ${patientName},`,
    `Your token number at ${getClinicName()} is *${tokenNumber}*${doctorName ? ` (Dr. ${doctorName})` : ''}.`,
    trackingLink ? `Track your live queue position here: ${trackingLink}` : null,
    'Please reach the clinic when your turn is near.',
    '- Sent via Appointory'
  ].filter(Boolean).join('\n');
}

/** Upcoming appointment reminder. */
export function appointmentReminderMessage({ patientName, appointmentDate, doctorName }) {
  const hasTime = appointmentDate && !Number.isNaN(new Date(appointmentDate).getTime());
  return [
    `Namaste ${patientName},`,
    `Reminder: your appointment at ${getClinicName()}${doctorName ? ` with Dr. ${doctorName}` : ''}`
      + (hasTime ? ` is on ${formatDate(appointmentDate)} at ${formatTime(appointmentDate)} (IST).` : ' is scheduled.'),
    'Please arrive 10 minutes early. Reply here if you need to reschedule.',
    '- Sent via Appointory'
  ].join('\n');
}

/** Billing receipt summary (amounts only, no clinical details). */
export function receiptMessage({ patientName, invoiceNumber, totalAmount, paidAmount, remainingDue, paymentMode }) {
  return [
    `Namaste ${patientName},`,
    `Thank you for visiting ${getClinicName()}.`,
    `Bill No: ${invoiceNumber}`,
    `Total: ₹${totalAmount}`,
    `Paid: ₹${paidAmount}${paymentMode ? ` (${paymentMode})` : ''}`,
    remainingDue > 0 ? `Balance due: ₹${remainingDue}` : 'Status: Fully paid',
    '- Sent via Appointory'
  ].join('\n');
}
