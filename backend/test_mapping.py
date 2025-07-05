#!/usr/bin/env python3
"""
Test script for Tavily Map integration.
Tests the paper discovery functionality using Tavily's mapping capabilities.
"""

import os
from dotenv import load_dotenv
from tavily_mapper import tavily_mapper

# Load environment variables
load_dotenv()

def test_tavily_mapping():
    """Test Tavily Map functionality for paper discovery"""
    print("🗺️ Testing Tavily Map Integration")
    print("=" * 50)
    
    # Check if Tavily API key is configured
    api_key = os.getenv('TAVILY_API_KEY')
    if not api_key:
        print("❌ Tavily API key not found!")
        print("Please set TAVILY_API_KEY environment variable")
        return False
    
    print(f"✅ Tavily API key configured: {api_key[:15]}...")
    print()
    
    # Test topic
    test_topic = "transformer neural networks"
    
    # Sample initial papers to enhance discovery
    initial_papers = [
        {
            "title": "Attention Is All You Need",
            "authors": ["Vaswani et al."],
            "url": "https://arxiv.org/abs/1706.03762",
            "keywords": ["transformer", "attention", "neural networks"]
        }
    ]
    
    try:
        print(f"📊 Discovering papers related to: '{test_topic}'")
        print("Initial papers provided for enhanced discovery:")
        for paper in initial_papers:
            print(f"  - {paper['title']}")
        print()
        
        # Run the mapping discovery
        result = tavily_mapper.discover_related_papers(
            topic=test_topic,
            initial_papers=initial_papers
        )
        
        print("✅ Mapping Discovery Complete!")
        print(f"📄 Papers discovered: {len(result['papers'])}")
        print(f"🔗 URLs explored: {result['total_discovered']}")
        print(f"🌐 Domains explored: {len(result['domains_explored'])}")
        print(f"📊 Paper connections found: {len(result.get('paper_connections', []))}")
        print()
        
        # Show domains explored
        if result['domains_explored']:
            print("🌐 Academic domains explored:")
            for domain in result['domains_explored']:
                print(f"  - {domain}")
            print()
        
        # Show sample discovered papers
        if result['papers']:
            print("📑 Sample discovered papers:")
            for i, paper in enumerate(result['papers'][:5]):  # Show first 5
                print(f"  {i+1}. {paper.get('title', 'No title')}")
                print(f"     Venue: {paper.get('venue', 'Unknown')}")
                print(f"     Credibility: {paper.get('credibility', 0)}/10")
                print(f"     URL: {paper.get('url', 'No URL')[:60]}...")
                print()
        
        return True
        
    except Exception as e:
        print(f"❌ Mapping discovery failed: {e}")
        return False

def test_simple_domain_mapping():
    """Test simple domain mapping functionality"""
    print("\n🔬 Testing Simple Domain Mapping")
    print("=" * 50)
    
    try:
        # Test mapping a single domain
        test_domain = "arxiv.org"
        test_topic = "machine learning"
        
        print(f"🗺️ Mapping domain: {test_domain}")
        print(f"📚 Topic: {test_topic}")
        print()
        
        discovered_urls = tavily_mapper.map_academic_domain(
            base_url=test_domain,
            topic=test_topic,
            max_depth=1,
            max_breadth=10,
            limit=20
        )
        
        print(f"✅ Domain mapping complete!")
        print(f"🔗 URLs discovered: {len(discovered_urls)}")
        
        if discovered_urls:
            print("\n📋 Sample discovered URLs:")
            for i, url in enumerate(discovered_urls[:5]):
                print(f"  {i+1}. {url}")
        
        return True
        
    except Exception as e:
        print(f"❌ Domain mapping failed: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Tavily Map Testing Suite")
    print("=" * 50)
    
    # Test full discovery
    discovery_success = test_tavily_mapping()
    
    # Test simple domain mapping
    mapping_success = test_simple_domain_mapping()
    
    print("\n📊 Test Results:")
    print(f"Paper Discovery: {'✅ PASS' if discovery_success else '❌ FAIL'}")
    print(f"Domain Mapping: {'✅ PASS' if mapping_success else '❌ FAIL'}")
    
    if discovery_success and mapping_success:
        print("\n🎉 Tavily Map integration is working correctly!")
        print("Your research assistant can now discover related papers through intelligent web mapping.")
    else:
        print("\n⚠️  Some tests failed. Check your Tavily API key and network connection.")
        print("The system will fall back to regular search if mapping is unavailable.") 