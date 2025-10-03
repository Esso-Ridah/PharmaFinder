import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ detail: 'No authorization header' });
    }

    // Get query parameters
    const { limit } = req.query;
    const queryString = limit ? `?limit=${limit}` : '';

    // Forward request to backend
    const response = await fetch(`http://localhost:8001/partner/analytics/top-products${queryString}`, {
      headers: {
        'Authorization': authHeader,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ 
        detail: errorText 
      });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error: any) {
    console.error('Top Products API Error:', error);
    return res.status(500).json({ 
      detail: 'Internal server error' 
    });
  }
}