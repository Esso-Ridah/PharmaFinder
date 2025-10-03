import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';

const TestLogin: NextPage = () => {
  const [email, setEmail] = useState('bbleze@outlook.com');
  const [password, setPassword] = useState('password123');
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [storedToken, setStoredToken] = useState<string>('');
  const [storedUser, setStoredUser] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  // Only run on client side
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      const user = localStorage.getItem('user_data');
      setStoredToken(token || '');
      setStoredUser(user || '');
    }
  }, []);

  const testLogin = async () => {
    setLoading(true);
    setResult('Testing...');
    
    try {
      // Clear any existing tokens
      if (typeof window !== 'undefined') {
        localStorage.clear();
      }
      
      // Use Next.js API route to avoid CORS issues
      console.log('1. Attempting login via API route...');
      const response = await fetch('/api/test-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      console.log('API response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        setResult(`❌ Login failed: ${response.status} - ${errorData.error}`);
        return;
      }

      const data = await response.json();
      console.log('2. Response data:', data);
      
      if (data.success) {
        // Store token
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', data.token);
          localStorage.setItem('user_data', JSON.stringify(data.user));
          setStoredToken(data.token);
          setStoredUser(JSON.stringify(data.user));
        }
        
        setResult(`✅ Success! User: ${data.user.first_name} ${data.user.last_name} (${data.user.role})`);
      } else {
        setResult(`❌ Unexpected response: ${JSON.stringify(data)}`);
      }
      
    } catch (error: any) {
      console.error('Error:', error);
      setResult(`❌ Network error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const redirectToDashboard = () => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user_data');
      if (userData) {
        const user = JSON.parse(userData);
        if (user.role === 'pharmacist') {
          window.location.href = '/partner/dashboard';
        } else {
          window.location.href = '/dashboard';
        }
      }
    }
  };

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Test Login Debug</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <label>Email:</label><br />
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: '300px', padding: '5px' }}
        />
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <label>Password:</label><br />
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '300px', padding: '5px' }}
        />
      </div>
      
      <button 
        onClick={testLogin} 
        disabled={loading}
        style={{ 
          padding: '10px 20px', 
          backgroundColor: loading ? '#ccc' : '#007bff', 
          color: 'white', 
          border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Testing...' : 'Test Login'}
      </button>
      
      <button 
        onClick={redirectToDashboard}
        style={{ 
          padding: '10px 20px', 
          backgroundColor: '#28a745', 
          color: 'white', 
          border: 'none',
          marginLeft: '10px',
          cursor: 'pointer'
        }}
      >
        Go to Dashboard
      </button>
      
      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        backgroundColor: '#f8f9fa', 
        border: '1px solid #dee2e6',
        whiteSpace: 'pre-wrap'
      }}>
        <strong>Result:</strong><br />
        {result}
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <h3>Stored Data:</h3>
        <p><strong>Token:</strong> {storedToken ? storedToken.substring(0, 50) + '...' : 'None'}</p>
        <p><strong>User:</strong> {storedUser || 'None'}</p>
      </div>
    </div>
  );
};

export default TestLogin;