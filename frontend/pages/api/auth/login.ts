import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;

    // Forward request to backend
    const loginResponse = await fetch('http://localhost:8001/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        username: username,
        password: password,
      }),
    });

    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      return res.status(loginResponse.status).json({ 
        detail: errorText 
      });
    }

    const tokenData = await loginResponse.json();
    return res.status(200).json(tokenData);

  } catch (error: any) {
    console.error('Login API Error:', error);
    return res.status(500).json({ 
      detail: 'Internal server error' 
    });
  }
}