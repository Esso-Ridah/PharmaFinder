import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    // Step 1: Login
    const loginResponse = await fetch('http://localhost:8001/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        username: email,
        password: password,
      }),
    });

    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      return res.status(loginResponse.status).json({ 
        error: `Login failed: ${loginResponse.status} - ${errorText}` 
      });
    }

    const tokenData = await loginResponse.json();

    // Step 2: Get Profile
    const profileResponse = await fetch('http://localhost:8001/auth/me', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });

    if (!profileResponse.ok) {
      const errorText = await profileResponse.text();
      return res.status(profileResponse.status).json({ 
        error: `Profile fetch failed: ${profileResponse.status} - ${errorText}` 
      });
    }

    const userData = await profileResponse.json();

    return res.status(200).json({
      success: true,
      token: tokenData.access_token,
      user: userData
    });

  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: `Server error: ${error.message}` 
    });
  }
}