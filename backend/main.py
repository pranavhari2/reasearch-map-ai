import os
import re
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from tavily import TavilyClient
from dotenv import load_dotenv
from llm_analyzer import llm_analyzer
from tavily_mapper import tavily_mapper

# Load environment variables
load_dotenv()

app = FastAPI(title="Research Assistant API", version="1.0.0")

# CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")

# Pydantic models
class Paper(BaseModel):
    id: int
    title: str
    authors: List[str]
    venue: str
    year: int
    citations: int
    credibility: float
    abstract: str
    keywords: List[str]
    url: str
    relevance: Optional[float] = None

class SearchRequest(BaseModel):
    topic: str
    max_results: int = 10

class SearchResponse(BaseModel):
    papers: List[Paper]
    total_found: int
    query: str

# Helper functions
def extract_year_from_content(content: str, title: str) -> int:
    """Extract publication year from content or title"""
    # Look for years in the content (2015-2024)
    year_pattern = r'\b(20[0-2][0-9])\b'
    years = re.findall(year_pattern, content + " " + title)
    
    if years:
        # Return the most recent year found
        return int(max(years))
    
    # Default to current year if no year found
    return 2023

def extract_authors_from_content(content: str, title: str) -> List[str]:
    """Extract authors from content using common patterns"""
    # Look for common author patterns
    author_patterns = [
        r'(?:by|authors?:?)\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s*,\s*[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)*)',
        r'([A-Z][a-z]+\s+[A-Z][a-z]+)(?:\s*,\s*([A-Z][a-z]+\s+[A-Z][a-z]+))*',
        r'([A-Z]\.\s*[A-Z][a-z]+)(?:\s*,\s*([A-Z]\.\s*[A-Z][a-z]+))*'
    ]
    
    text = content[:500]  # Look at first 500 chars
    
    for pattern in author_patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        if matches:
            authors = []
            for match in matches:
                if isinstance(match, tuple):
                    authors.extend([m for m in match if m])
                else:
                    authors.append(match)
            
            # Clean and limit authors
            clean_authors = []
            for author in authors[:5]:  # Max 5 authors
                author = author.strip()
                if len(author) > 3 and len(author) < 50:
                    clean_authors.append(author)
            
            if clean_authors:
                return clean_authors
    
    # Default fallback
    return ["Various Authors"]

def extract_venue_from_url(url: str) -> str:
    """Extract venue from URL domain"""
    domain_to_venue = {
        'arxiv.org': 'arXiv',
        'ieee.org': 'IEEE',
        'acm.org': 'ACM',
        'springer.com': 'Springer',
        'elsevier.com': 'Elsevier',
        'wiley.com': 'Wiley',
        'nature.com': 'Nature',
        'science.org': 'Science',
        'semanticscholar.org': 'Semantic Scholar',
        'researchgate.net': 'ResearchGate',
        'openreview.net': 'OpenReview'
    }
    
    for domain, venue in domain_to_venue.items():
        if domain in url:
            return venue
    
    return "Conference/Journal"

def calculate_credibility(content: str, url: str, title: str) -> float:
    """Calculate credibility score based on various factors"""
    score = 5.0  # Base score
    
    # Venue-based scoring
    if 'arxiv.org' in url:
        score += 1.5
    elif any(domain in url for domain in ['ieee.org', 'acm.org', 'nature.com', 'science.org']):
        score += 2.0
    elif any(domain in url for domain in ['springer.com', 'elsevier.com']):
        score += 1.0
    
    # Content quality indicators
    content_lower = content.lower()
    if any(word in content_lower for word in ['citation', 'peer-reviewed', 'journal']):
        score += 0.5
    
    if any(word in content_lower for word in ['conference', 'proceedings', 'workshop']):
        score += 0.3
    
    # Title quality
    if len(title) > 20 and len(title) < 200:
        score += 0.2
    
    # Clamp score between 1 and 10
    return min(max(score, 1.0), 10.0)

def estimate_citations(credibility: float, year: int) -> int:
    """Estimate citation count based on credibility and age"""
    current_year = 2024
    age = max(1, current_year - year)
    
    # Base citations from credibility
    base_citations = int(credibility * 100)
    
    # Age factor (older papers tend to have more citations)
    age_factor = min(age * 50, 500)
    
    # Random variation
    import random
    variation = random.randint(-200, 1000)
    
    return max(10, base_citations + age_factor + variation)

def extract_keywords_from_content(content: str, title: str, topic: str) -> List[str]:
    """Extract relevant keywords from content and title"""
    # Common AI/ML/CS keywords
    common_keywords = [
        'machine learning', 'deep learning', 'neural networks', 'artificial intelligence',
        'computer vision', 'natural language processing', 'nlp', 'transformer',
        'attention', 'cnn', 'rnn', 'lstm', 'gpt', 'bert', 'gan', 'reinforcement learning',
        'supervised learning', 'unsupervised learning', 'classification', 'regression',
        'clustering', 'optimization', 'algorithm', 'model', 'training', 'inference',
        'dataset', 'benchmark', 'evaluation', 'performance', 'accuracy', 'prediction'
    ]
    
    text = (content + " " + title + " " + topic).lower()
    found_keywords = []
    
    for keyword in common_keywords:
        if keyword in text:
            found_keywords.append(keyword)
    
    # Add topic-specific keywords
    topic_words = re.findall(r'\b[a-z]{3,}\b', topic.lower())
    for word in topic_words:
        if word not in found_keywords and len(word) > 2:
            found_keywords.append(word)
    
    return found_keywords[:8]  # Limit to 8 keywords

# API endpoints
@app.get("/")
async def root():
    return {"message": "Research Assistant API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "api_key_configured": bool(TAVILY_API_KEY)}

@app.post("/search-papers", response_model=SearchResponse)
async def search_papers(request: SearchRequest):
    """Search for research papers using Tavily AI"""
    
    if not TAVILY_API_KEY:
        raise HTTPException(status_code=500, detail="Tavily API key not configured")
    
    try:
        client = TavilyClient(api_key=TAVILY_API_KEY)
        
        # Formulate query for research papers
        query = f"research papers on \"{request.topic}\""
        
        # Academic domains to prioritize
        academic_domains = [
            "arxiv.org", "semanticscholar.org", "ieee.org", "acm.org",
            "springer.com", "wiley.com", "elsevier.com", "researchgate.net",
            "sciencedirect.com", "mdpi.com", "nature.com", "science.org",
            "cambridge.org", "oxford.universitypress.com", "openreview.net"
        ]
        
        # Search with Tavily - ensure minimum 15 papers
        max_results = max(request.max_results, 15)  # Ensure at least 15
        response = client.search(
            query=query,
            search_depth="advanced",
            max_results=max_results,
            include_raw_content=True,
            include_domains=academic_domains
        )
        
        papers = []
        if response and response.get('results'):
            for i, result in enumerate(response['results']):
                title = result.get('title', 'Untitled Paper')
                content = result.get('content', '')
                url = result.get('url', '')
                
                # Extract information
                year = extract_year_from_content(content, title)
                authors = extract_authors_from_content(content, title)
                venue = extract_venue_from_url(url)
                credibility = calculate_credibility(content, url, title)
                citations = estimate_citations(credibility, year)
                keywords = extract_keywords_from_content(content, title, request.topic)
                
                # Use content as abstract (truncated)
                abstract = content[:500] + "..." if len(content) > 500 else content
                
                paper = Paper(
                    id=i + 1,
                    title=title,
                    authors=authors,
                    venue=venue,
                    year=year,
                    citations=citations,
                    credibility=round(credibility, 1),
                    abstract=abstract,
                    keywords=keywords,
                    url=url
                )
                papers.append(paper)
        
        return SearchResponse(
            papers=papers,
            total_found=len(papers),
            query=request.topic
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@app.get("/search-papers-simple")
async def search_papers_simple(topic: str = Query(..., description="Research topic to search for")):
    """Simple GET endpoint for searching papers"""
    request = SearchRequest(topic=topic)
    return await search_papers(request)

@app.post("/search-papers-with-analysis")
async def search_papers_with_analysis(request: SearchRequest):
    """Search for research papers using Tavily AI and analyze connections with LLM"""
    
    # First, get the papers using existing search
    search_response = await search_papers(request)
    
    if not search_response.papers:
        return {
            "papers": [],
            "total_found": 0,
            "query": request.topic,
            "graph_data": {
                "nodes": [],
                "edges": [],
                "entity_clusters": []
            }
        }
    
    # Convert papers to dict format for LLM analysis
    papers_for_analysis = []
    for paper in search_response.papers:
        paper_dict = {
            "id": str(paper.id),
            "title": paper.title,
            "authors": paper.authors,
            "year": paper.year,
            "abstract": paper.abstract,
            "keywords": paper.keywords,
            "venue": paper.venue,
            "url": paper.url,
            "credibility_score": paper.credibility
        }
        papers_for_analysis.append(paper_dict)
    
    # Analyze papers with Gemini LLM
    try:
        graph_data = llm_analyzer.analyze_papers(papers_for_analysis)
    except Exception as e:
        # If Gemini LLM analysis fails, return papers without graph data
        print(f"Gemini LLM analysis failed: {e}")
        graph_data = {
            "nodes": [],
            "edges": [],
            "entity_clusters": []
        }
    
    return {
        "papers": search_response.papers,
        "total_found": search_response.total_found,
        "query": search_response.query,
        "graph_data": graph_data
    }

@app.post("/discover-papers-with-mapping")
async def discover_papers_with_mapping(request: SearchRequest):
    """Search and discover papers using Tavily Search + Map + LLM analysis"""
    
    # Step 1: Get initial papers using regular search
    search_response = await search_papers(request)
    
    if not search_response.papers:
        return {
            "papers": [],
            "mapped_papers": [],
            "total_found": 0,
            "mapping_stats": {},
            "query": request.topic,
            "graph_data": {"nodes": [], "edges": [], "entity_clusters": []}
        }
    
    # Step 2: Use Tavily Map to discover related papers
    try:
        # Convert papers to dict format for mapping
        initial_papers = []
        for paper in search_response.papers[:5]:  # Use top 5 papers for mapping
            paper_dict = {
                "title": paper.title,
                "authors": paper.authors,
                "url": paper.url,
                "keywords": paper.keywords
            }
            initial_papers.append(paper_dict)
        
        # Discover related papers through mapping
        mapping_result = tavily_mapper.discover_related_papers(
            topic=request.topic,
            initial_papers=initial_papers
        )
        
        mapped_papers = mapping_result.get("papers", [])
        paper_connections = mapping_result.get("paper_connections", [])
        mapping_stats = {
            "domains_explored": mapping_result.get("domains_explored", []),
            "total_urls_discovered": mapping_result.get("total_discovered", 0),
            "papers_extracted": len(mapped_papers),
            "connections_found": len(paper_connections)
        }
        
    except Exception as e:
        print(f"Mapping discovery failed: {e}")
        mapped_papers = []
        mapping_stats = {"error": str(e)}
    
    # Step 3: Combine original and mapped papers
    all_papers = list(search_response.papers)
    
    # Convert mapped papers to Paper objects
    for mapped_paper in mapped_papers:
        try:
            paper_obj = Paper(
                id=mapped_paper.get("id", len(all_papers) + 1),
                title=mapped_paper.get("title", "Discovered Paper"),
                authors=mapped_paper.get("authors", []),
                venue=mapped_paper.get("venue", "Academic Venue"),
                year=mapped_paper.get("year", 2023),
                citations=mapped_paper.get("citations", 0),
                credibility=mapped_paper.get("credibility", 6.0),
                abstract=mapped_paper.get("abstract", ""),
                keywords=mapped_paper.get("keywords", []),
                url=mapped_paper.get("url", "")
            )
            all_papers.append(paper_obj)
        except Exception as e:
            print(f"Error converting mapped paper: {e}")
            continue
    
    # Step 4: Analyze with LLM
    papers_for_analysis = []
    for paper in all_papers:
        paper_dict = {
            "id": str(paper.id),
            "title": paper.title,
            "authors": paper.authors,
            "year": paper.year,
            "abstract": paper.abstract,
            "keywords": paper.keywords,
            "venue": paper.venue,
            "url": paper.url,
            "credibility_score": paper.credibility
        }
        papers_for_analysis.append(paper_dict)
    
    # Analyze papers with Gemini LLM
    try:
        graph_data = llm_analyzer.analyze_papers(papers_for_analysis)
        
        # Enhance graph data with Tavily Map connections
        if paper_connections:
            # Convert paper connections to graph edges
            tavily_edges = []
            for conn in paper_connections:
                edge = {
                    "source": str(conn["source"]),
                    "target": str(conn["target"]),
                    "relationship_type": conn.get("connection_type", "Similar"),
                    "strength": int(conn.get("similarity", 0.5) * 10),  # Scale 0-10
                    "description": f"Papers connected through {conn.get('connection_type', 'similarity')}",
                    "shared_entities": conn.get("shared_keywords", [])
                }
                tavily_edges.append(edge)
            
            # Combine LLM edges with Tavily Map edges
            existing_edges = graph_data.get("edges", [])
            combined_edges = existing_edges + tavily_edges
            graph_data["edges"] = combined_edges
            
    except Exception as e:
        print(f"LLM analysis failed: {e}")
        # Create fallback graph data with Tavily Map connections
        graph_data = {"nodes": [], "edges": [], "entity_clusters": []}
        
        if paper_connections:
            fallback_edges = []
            for conn in paper_connections:
                edge = {
                    "source": str(conn["source"]),
                    "target": str(conn["target"]),
                    "relationship_type": conn.get("connection_type", "Similar"),
                    "strength": int(conn.get("similarity", 0.5) * 10),
                    "description": f"Papers connected through {conn.get('connection_type', 'similarity')}",
                    "shared_entities": conn.get("shared_keywords", [])
                }
                fallback_edges.append(edge)
            graph_data["edges"] = fallback_edges
    
    return {
        "papers": search_response.papers,
        "mapped_papers": mapped_papers,
        "total_found": len(all_papers),
        "mapping_stats": mapping_stats,
        "query": request.topic,
        "graph_data": graph_data
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 