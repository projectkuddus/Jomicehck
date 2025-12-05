import type { VercelRequest, VercelResponse } from '@vercel/node';

// Contact form API endpoint
// Sends email via Resend (or fallback to console log for development)

interface ContactRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, subject, message } = req.body as ContactRequest;

    // Validate input
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!email.includes('@') || !email.includes('.')) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    // Email service configuration
    const resendApiKey = process.env.RESEND_API_KEY;
    const supportEmail = process.env.SUPPORT_EMAIL || 'support@jomicheck.com';

    if (resendApiKey) {
      // Use Resend API to send email
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'JomiCheck Support <noreply@jomicheck.com>',
            to: [supportEmail],
            replyTo: email,
            subject: `[JomiCheck Support] ${subject}`,
            html: `
              <h2>New Contact Form Submission</h2>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Subject:</strong> ${subject}</p>
              <hr>
              <p><strong>Message:</strong></p>
              <p>${message.replace(/\n/g, '<br>')}</p>
            `,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to send email');
        }

        return res.status(200).json({
          success: true,
          message: 'Message sent successfully! We\'ll get back to you soon.',
        });
      } catch (emailError: any) {
        console.error('Resend API error:', emailError);
        // Fall through to fallback
      }
    }

    // Fallback: Log to console (for development) or save to database
    console.log('Contact Form Submission:', {
      name,
      email,
      subject,
      message,
      timestamp: new Date().toISOString(),
    });

    // TODO: Save to Supabase contact_messages table for manual review
    // For now, return success (admin can check logs/database)

    return res.status(200).json({
      success: true,
      message: 'Message received! We\'ll get back to you soon.',
      note: 'Email service not configured. Message logged for review.',
    });
  } catch (error: any) {
    console.error('Contact API error:', error);
    return res.status(500).json({ error: 'Failed to send message. Please try again later.' });
  }
}

