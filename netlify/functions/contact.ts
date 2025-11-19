// Netlify Function for handling contact form submissions
import { Handler } from '@netlify/functions';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const handler: Handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Allow': 'POST',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Parse form data
    const formData: ContactFormData = JSON.parse(event.body || '{}');
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          error: 'Missing required fields: name, email, and message are required' 
        }),
      };
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          error: 'Invalid email format' 
        }),
      };
    }

    // Here you would typically:
    // 1. Send email using a service like SendGrid, Mailgun, etc.
    // 2. Save to database
    // 3. Send notification to admin
    
    // For now, we'll just log the submission
    console.log('Contact form submission:', {
      name: formData.name,
      email: formData.email,
      subject: formData.subject || 'No subject',
      message: formData.message,
      timestamp: new Date().toISOString(),
      userAgent: event.headers['user-agent'],
      ip: event.headers['x-forwarded-for'] || event.headers['x-nf-client-connection-ip'],
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ 
        success: true,
        message: 'Thank you for your message! We will get back to you soon.' 
      }),
    };

  } catch (error) {
    console.error('Contact form error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        error: 'Internal server error. Please try again later.' 
      }),
    };
  }
};