#!/usr/bin/env python3
"""
Test script to verify API endpoints are working correctly.
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_health_endpoint():
    """Test the health endpoint"""
    print("🔍 Testing Health Endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Health endpoint failed: {e}")
        return False

def test_search_papers_endpoint():
    """Test the basic search papers endpoint"""
    print("\n🔍 Testing Search Papers Endpoint...")
    try:
        data = {
            "topic": "machine learning",
            "max_results": 5
        }
        response = requests.post(f"{BASE_URL}/search-papers", json=data)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"Papers found: {len(result.get('papers', []))}")
            return True
        else:
            print(f"Error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Search papers endpoint failed: {e}")
        return False

def test_mapping_endpoint():
    """Test the mapping endpoint"""
    print("\n🔍 Testing Mapping Endpoint...")
    try:
        data = {
            "topic": "machine learning",
            "max_results": 5
        }
        response = requests.post(f"{BASE_URL}/discover-papers-with-mapping", json=data)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"Papers found: {len(result.get('papers', []))}")
            print(f"Mapped papers: {len(result.get('mapped_papers', []))}")
            return True
        else:
            print(f"Error Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Mapping endpoint failed: {e}")
        return False

def list_available_endpoints():
    """List all available endpoints"""
    print("\n📋 Available Endpoints:")
    try:
        response = requests.get(f"{BASE_URL}/docs")
        if response.status_code == 200:
            print("✅ API documentation available at /docs")
        else:
            print("❌ API documentation not available")
    except Exception as e:
        print(f"❌ Could not check API docs: {e}")

if __name__ == "__main__":
    print("🚀 Testing Research Assistant API Endpoints")
    print("=" * 50)
    
    # Test if server is running
    try:
        response = requests.get(BASE_URL)
        print(f"✅ Server is running at {BASE_URL}")
    except Exception as e:
        print(f"❌ Server is not running at {BASE_URL}: {e}")
        print("Please start the backend server first!")
        exit(1)
    
    # Run tests
    health_ok = test_health_endpoint()
    search_ok = test_search_papers_endpoint()
    mapping_ok = test_mapping_endpoint()
    
    # List endpoints
    list_available_endpoints()
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 Test Results:")
    print(f"Health Endpoint: {'✅ PASS' if health_ok else '❌ FAIL'}")
    print(f"Search Papers: {'✅ PASS' if search_ok else '❌ FAIL'}")
    print(f"Mapping Endpoint: {'✅ PASS' if mapping_ok else '❌ FAIL'}")
    
    if all([health_ok, search_ok, mapping_ok]):
        print("\n🎉 All endpoints are working correctly!")
    else:
        print("\n⚠️  Some endpoints are not working. Check the backend server.") 