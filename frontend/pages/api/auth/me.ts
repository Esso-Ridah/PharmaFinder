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

    // Forward request to backend
    const profileResponse = await fetch('http://localhost:8001/auth/me', {
      headers: {
        'Authorization': authHeader,
      },
    });

    if (!profileResponse.ok) {
      const errorText = await profileResponse.text();
      return res.status(profileResponse.status).json({ 
        detail: errorText 
      });
    }

    const userData = await profileResponse.json();
    return res.status(200).json(userData);

  } catch (error: any) {
    console.error('Profile API Error:', error);
    return res.status(500).json({ 
      detail: 'Internal server error' 
    });
  }
}