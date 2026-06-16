import emailjs from '@emailjs/browser'

export function notifyGuestRegistered(guestName) {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
  const publicKey  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

  // Skip silently if not configured yet
  if (!serviceId || !templateId || !publicKey) return Promise.resolve()

  return emailjs.send(serviceId, templateId, { guest_name: guestName }, { publicKey })
}
