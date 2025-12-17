import Mailjet from 'node-mailjet'

let mailjet = null

export function initMailjet(apiKey, apiSecret) {
  if (apiKey && apiSecret) {
    mailjet = Mailjet.apiConnect(apiKey, apiSecret)
    return true
  }
  return false
}

export async function sendEmail(to, subject, htmlContent, textContent = '') {
  if (!mailjet) {
    console.error('Mailjet not initialized. Please set MAILJET_API_KEY and MAILJET_API_SECRET environment variables.')
    return { success: false, error: 'Mailjet not configured' }
  }

  try {
    const request = mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: process.env.MAILJET_FROM_EMAIL || 'noreply@aethergens.com',
            Name: 'AetherGens'
          },
          To: [
            {
              Email: to,
              Name: to.split('@')[0]
            }
          ],
          Subject: subject,
          TextPart: textContent || htmlContent.replace(/<[^>]*>/g, ''),
          HTMLPart: htmlContent
        }
      ]
    })

    const result = await request
    return { success: true, result }
  } catch (error) {
    console.error('Mailjet error:', error)
    return { success: false, error: error.message }
  }
}

export async function sendStaffApplicationNotification(application, rankName = '') {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@aethergens.com'
  const subject = `New Staff Application: ${application.name}${rankName ? ` - ${rankName}` : ''}`
  let htmlContent = `
    <h2>New Staff Application Received</h2>
    <p><strong>Name:</strong> ${application.name}</p>
    <p><strong>Email:</strong> ${application.email}</p>
    <p><strong>Discord:</strong> ${application.discord}</p>
    <p><strong>Age:</strong> ${application.age}</p>
    <p><strong>Minecraft Username:</strong> ${application.minecraft_username || 'N/A'}</p>
  `
  if (rankName) {
    htmlContent += `<p><strong>Applied for:</strong> ${rankName}</p>`
  }
  htmlContent += `
    <p><strong>Experience:</strong></p>
    <p>${application.experience}</p>
    <p><strong>Why they want to be staff:</strong></p>
    <p>${application.why}</p>
    <p><strong>Previous Staff Experience:</strong></p>
    <p>${application.previous_staff || 'None'}</p>
  `
  if (application.answers && Object.keys(application.answers).length > 0) {
    htmlContent += `<p><strong>Additional Answers:</strong></p>`
    Object.entries(application.answers).forEach(([idx, answer]) => {
      htmlContent += `<p><strong>Question ${parseInt(idx) + 1}:</strong> ${answer}</p>`
    })
  }
  htmlContent += `<p><strong>Application ID:</strong> ${application.id}</p>`
  return await sendEmail(adminEmail, subject, htmlContent)
}

export async function sendStaffApplicationResponse(application, status) {
  const subject = status === 'accepted' 
    ? 'Staff Application Accepted - AetherGens' 
    : 'Staff Application Update - AetherGens'
  
  const htmlContent = status === 'accepted'
    ? `
      <h2>Congratulations!</h2>
      <p>Dear ${application.name},</p>
      <p>We're excited to inform you that your staff application has been accepted!</p>
      <p>Our team will contact you shortly with further instructions.</p>
      <p>Welcome to the AetherGens staff team!</p>
    `
    : `
      <h2>Application Update</h2>
      <p>Dear ${application.name},</p>
      <p>Thank you for your interest in joining the AetherGens staff team.</p>
      <p>Unfortunately, we're unable to proceed with your application at this time.</p>
      <p>We appreciate your interest and encourage you to apply again in the future.</p>
    `
  
  return await sendEmail(application.email, subject, htmlContent)
}

