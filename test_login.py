#!/usr/bin/env python3
import requests
import json

# Test login functionality
def test_login():
    url = "http://localhost:8001"
    
    # Test credentials  
    credentials = {
        'username': 'bbleze@outlook.com',
        'password': 'password123'
    }
    
    print(f"Testing login for: {credentials['username']}")
    
    # Send login request
    response = requests.post(
        f"{url}/auth/login",
        data=credentials,  # form data
        headers={'Content-Type': 'application/x-www-form-urlencoded'}
    )
    
    print(f"Login response status: {response.status_code}")
    print(f"Login response: {response.text}")
    
    if response.status_code == 200:
        token_data = response.json()
        access_token = token_data['access_token']
        print(f"Token obtained: {access_token[:50]}...")
        
        # Test getting profile with token
        profile_response = requests.get(
            f"{url}/auth/me",
            headers={'Authorization': f'Bearer {access_token}'}
        )
        
        print(f"Profile response status: {profile_response.status_code}")
        print(f"Profile response: {profile_response.text}")
        
        if profile_response.status_code == 200:
            user_data = profile_response.json()
            print(f"User role: {user_data.get('role')}")
            print("✅ Authentication flow working correctly!")
        else:
            print("❌ Profile fetch failed")
    else:
        print("❌ Login failed")

if __name__ == "__main__":
    test_login()