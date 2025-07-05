#!/usr/bin/env python3
"""
Test script to demonstrate LLM analysis functionality.
Run this to verify that your OpenAI API key is working and the LLM analyzer is functioning.
"""

import os
from dotenv import load_dotenv
from llm_analyzer import llm_analyzer

# Load environment variables
load_dotenv()

# Sample papers for testing
sample_papers = [
    {
        "id": "1",
        "title": "Attention Is All You Need",
        "authors": ["Vaswani, A.", "Shazeer, N.", "Parmar, N."],
        "year": 2017,
        "abstract": "We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely.",
        "keywords": ["transformer", "attention", "neural networks", "nlp"],
        "venue": "NIPS",
        "url": "https://arxiv.org/abs/1706.03762",
        "credibility_score": 9.8
    },
    {
        "id": "2",
        "title": "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding",
        "authors": ["Devlin, J.", "Chang, M.", "Lee, K."],
        "year": 2019,
        "abstract": "We introduce BERT, which stands for Bidirectional Encoder Representations from Transformers. BERT is designed to pre-train deep bidirectional representations from unlabeled text by jointly conditioning on both left and right context in all layers.",
        "keywords": ["bert", "transformer", "pretraining", "nlp", "bidirectional"],
        "venue": "NAACL",
        "url": "https://arxiv.org/abs/1810.04805",
        "credibility_score": 9.5
    },
    {
        "id": "3",
        "title": "GPT-3: Language Models are Few-Shot Learners",
        "authors": ["Brown, T.", "Mann, B.", "Ryder, N."],
        "year": 2020,
        "abstract": "We train GPT-3, an autoregressive language model with 175 billion parameters, 10x more than any previous non-sparse language model, and test its performance in the few-shot setting.",
        "keywords": ["gpt", "language model", "few-shot", "autoregressive", "nlp"],
        "venue": "ArXiv",
        "url": "https://arxiv.org/abs/2005.14165",
        "credibility_score": 9.2
    }
]

def test_llm_analysis():
    """Test the LLM analysis functionality"""
    print("🧠 Testing LLM Analysis Functionality")
    print("=" * 50)
    
    # Check if Google API key is configured
    api_key = os.getenv('GOOGLE_API_KEY')
    if not api_key:
        print("❌ Google API key not found!")
        print("Please set GOOGLE_API_KEY environment variable")
        return
    
    print(f"✅ Google API key configured: {api_key[:10]}...")
    print()
    
    # Test the LLM analyzer
    print("📊 Analyzing sample papers...")
    print("Sample papers:")
    for paper in sample_papers:
        print(f"  - {paper['title']} ({paper['year']})")
    print()
    
    try:
        # Run the analysis
        result = llm_analyzer.analyze_papers(sample_papers)
        
        print("✅ LLM Analysis Complete!")
        print(f"📄 Nodes found: {len(result['nodes'])}")
        print(f"🔗 Edges found: {len(result['edges'])}")
        print(f"🏷️ Entity clusters: {len(result['entity_clusters'])}")
        print()
        
        # Display some sample connections
        if result['edges']:
            print("🔗 Sample connections found:")
            for edge in result['edges'][:3]:  # Show first 3 connections
                print(f"  - {edge['source']} → {edge['target']}")
                print(f"    Type: {edge['relationship_type']}")
                print(f"    Strength: {edge['strength']}/5")
                print(f"    Description: {edge['description']}")
                print()
        
        # Display entity clusters if any
        if result['entity_clusters']:
            print("🏷️ Entity clusters:")
            for cluster in result['entity_clusters'][:2]:  # Show first 2 clusters
                print(f"  - {cluster['entity_name']} ({cluster['entity_type']})")
                print(f"    Papers: {cluster['papers']}")
                print()
        
        return True
        
    except Exception as e:
        print(f"❌ LLM Analysis failed: {str(e)}")
        return False

def test_fallback_analysis():
    """Test the fallback similarity analysis"""
    print("\n🔄 Testing Fallback Analysis")
    print("=" * 50)
    
    # Temporarily disable Gemini
    original_model = llm_analyzer.gemini_model
    llm_analyzer.gemini_model = None
    
    try:
        result = llm_analyzer.analyze_papers(sample_papers)
        
        print("✅ Fallback Analysis Complete!")
        print(f"📄 Nodes found: {len(result['nodes'])}")
        print(f"🔗 Edges found: {len(result['edges'])}")
        print()
        
        if result['edges']:
            print("🔗 Similarity-based connections:")
            for edge in result['edges'][:2]:
                print(f"  - {edge['source']} → {edge['target']}")
                print(f"    Strength: {edge['strength']:.2f}")
                print(f"    Description: {edge['description']}")
                print()
        
        return True
        
    finally:
        # Restore Gemini model
        llm_analyzer.gemini_model = original_model

if __name__ == "__main__":
    print("🚀 Research Assistant LLM Analysis Test")
    print("=" * 50)
    
    # Test LLM analysis
    llm_success = test_llm_analysis()
    
    # Test fallback analysis
    fallback_success = test_fallback_analysis()
    
    print("\n📊 Test Results:")
    print(f"LLM Analysis: {'✅ PASS' if llm_success else '❌ FAIL'}")
    print(f"Fallback Analysis: {'✅ PASS' if fallback_success else '❌ FAIL'}")
    
    if llm_success:
        print("\n🎉 Your Gemini LLM analysis is working correctly!")
        print("You can now use the enhanced research assistant with intelligent paper connections.")
    else:
        print("\n⚠️  Gemini LLM analysis not working, but fallback is available.")
        print("The system will use keyword-based similarity for connections.") 