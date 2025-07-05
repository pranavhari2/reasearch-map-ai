#!/usr/bin/env python3
"""
Quick test to verify Gemini API integration works correctly.
"""

import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_gemini_api():
    """Test basic Gemini API functionality"""
    print("🧠 Testing Gemini 1.5 Pro API Integration")
    print("=" * 50)
    
    # Check if API key is configured
    api_key = os.getenv('GOOGLE_API_KEY')
    if not api_key:
        print("❌ Google API key not found!")
        print("Please set GOOGLE_API_KEY environment variable")
        print("You can get one at: https://makersuite.google.com/app/apikey")
        return False
    
    print(f"✅ Google API key configured: {api_key[:10]}...")
    
    try:
        # Configure Gemini
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-pro')
        
        # Test prompt
        test_prompt = """
        You are a research analyst. Given these two papers:
        
        Paper 1: "Attention Is All You Need" - Introduces transformer architecture
        Paper 2: "BERT: Pre-training of Deep Bidirectional Transformers" - Uses transformers for language understanding
        
        What is the relationship between these papers? Respond in JSON format:
        {
          "relationship": "Builds_Upon",
          "description": "Brief explanation",
          "strength": 4
        }
        """
        
        print("\n🚀 Testing Gemini with sample prompt...")
        response = model.generate_content(test_prompt)
        
        print("✅ Gemini API Response:")
        print(response.text)
        
        return True
        
    except Exception as e:
        print(f"❌ Gemini API test failed: {e}")
        return False

if __name__ == "__main__":
    success = test_gemini_api()
    
    if success:
        print("\n🎉 Gemini API integration is working!")
        print("Your research assistant is ready to use Gemini 1.5 Pro for intelligent paper analysis.")
    else:
        print("\n⚠️  Gemini API not working.")
        print("The system will use fallback similarity-based connections.") 