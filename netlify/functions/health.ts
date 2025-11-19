// Health check endpoint for monitoring
import { Handler } from '@netlify/functions';

export const handler: Handler = async (event, context) => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: {
        'Allow': 'GET',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.VITE_APP_VERSION || '1.0.0',
      environment: process.env.CONTEXT || 'unknown',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      node_version: process.version,
      checks: {
        database: 'not_implemented', // Could add Supabase connection check
        storage: 'not_implemented',   // Could add storage availability check
        external_apis: 'not_implemented'
      }
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(healthData, null, 2),
    };

  } catch (error) {
    console.error('Health check error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
      body: JSON.stringify({ 
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Internal server error'
      }),
    };
  }
};