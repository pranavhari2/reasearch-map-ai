# Research Assistant AI - Architecture & Integration Guide

## 🔧 System Architecture Overview

This AI Research Assistant is a full-stack application that discovers and analyzes academic research papers through intelligent web mapping and LLM-powered analysis. The system integrates **Tavily AI** for web search and mapping, **Google Gemini** for paper analysis, and provides an interactive graph visualization interface.

## 🏗️ Architecture Components

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                       │
├─────────────────────────────────────────────────────────────────┤
│  • React Components with TypeScript                             │
│  • D3.js Graph Visualization                                    │
│  • Real-time API Communication                                  │
│  • Interactive Knowledge Graph UI                               │
└─────────────────────────────────────────────────────────────────┘
                                   ↕ HTTP/REST API
┌─────────────────────────────────────────────────────────────────┐
│                      Backend (FastAPI)                          │
├─────────────────────────────────────────────────────────────────┤
│  • FastAPI REST API Endpoints                                   │
│  • CORS Middleware for Frontend Communication                   │
│  • Paper Search & Analysis Pipeline                             │
│  • Data Processing & Transformation                             │
└─────────────────────────────────────────────────────────────────┘
                                   ↕
┌─────────────────────────────────────────────────────────────────┐
│                  External AI Services                           │
├─────────────────────────────────────────────────────────────────┤
│  • Tavily AI: Web Search & Mapping                             │
│  • Google Gemini: LLM Analysis                                 │
│  • Academic Domain Crawling                                    │
└─────────────────────────────────────────────────────────────────┘
```

## 📊 Data Flow Architecture

### 1. Frontend → Backend Communication

- **Protocol**: HTTP REST API
- **Port**: Frontend (3000) → Backend (8000)
- **Format**: JSON requests/responses
- **CORS**: Configured for cross-origin requests

### 2. Backend → AI Services Integration

- **Tavily API**: Research paper discovery and web mapping
- **Gemini API**: Semantic analysis and relationship extraction
- **Processing**: Multi-step pipeline for data enrichment

## 🔍 Tavily Integration

### Purpose

Tavily AI provides intelligent web search and mapping capabilities specifically designed for academic research discovery.

### Key Features

- **Academic Domain Mapping**: Crawls academic websites (arXiv, IEEE, ACM, etc.)
- **Citation Network Discovery**: Finds interconnected research papers
- **Intelligent Web Traversal**: Follows academic links and references
- **Paper Metadata Extraction**: Extracts titles, authors, abstracts, and keywords

### Implementation Details

#### 1. `tavily_mapper.py` - Core Integration Module

```python
class TavilyMapper:
    def __init__(self):
        self.tavily_api_key = os.getenv("TAVILY_API_KEY")
        self.client = TavilyClient(api_key=self.tavily_api_key)
        self.academic_domains = [
            "arxiv.org", "scholar.google.com", "semanticscholar.org",
            "ieee.org", "acm.org", "springer.com", "nature.com"
        ]
```

#### 2. Discovery Pipeline

- **Step 1**: Initial search using Tavily's search API
- **Step 2**: Map academic domains for related papers
- **Step 3**: Extract paper metadata from discovered URLs
- **Step 4**: Generate connections between papers

#### 3. API Endpoints Using Tavily

```
POST /search-papers                    # Basic paper search
POST /search-papers-with-analysis     # Search + LLM analysis
POST /discover-papers-with-mapping    # Advanced mapping + analysis
```

### Tavily Configuration

```python
# Academic path patterns prioritized
academic_paths = [
    r'/paper/.*', r'/papers/.*', r'/publication/.*',
    r'/abs/.*', r'/pdf/.*', r'/article/.*'
]

# Enhanced discovery with increased limits
discovered = self.map_academic_domain(
    base_url=domain,
    topic=topic,
    max_depth=3,      # Increased crawling depth
    max_breadth=35,   # More links per page
    limit=75          # Higher URL processing limit
)
```

## 🧠 Gemini Integration

### Purpose

Google Gemini provides advanced LLM capabilities for semantic analysis, relationship extraction, and knowledge graph construction.

### Key Features

- **Citation Analysis**: Identifies direct and indirect citations
- **Semantic Similarity**: Analyzes terminological and conceptual relationships
- **Knowledge Graph Construction**: Maps research lineage and connections
- **Relationship Classification**: Categorizes connections by type and strength

### Implementation Details

#### 1. `llm_analyzer.py` - Core Analysis Module

```python
class LLMAnalyzer:
    def __init__(self):
        self.gemini_model = genai.GenerativeModel('gemini-1.5-pro')
        self.relationship_types = [
            "Builds_Upon", "Contradicts", "Validates", "Applies",
            "Compares", "Cites", "Shares_Method"
        ]
```

#### 2. Analysis Pipeline

- **Step 1**: Batch papers for efficient processing
- **Step 2**: Generate analysis prompts with academic context
- **Step 3**: Extract structured knowledge graph data
- **Step 4**: Merge results from multiple batches

#### 3. Relationship Analysis

```python
# Priority system for relationship weighting
relationship_weights = {
    "Cites": 5,         # Direct citation - highest priority
    "Builds_Upon": 4,   # Methodological extension
    "Validates": 4,     # Empirical confirmation
    "Applies": 3,       # Method application
    "Compares": 3,      # Comparative analysis
}
```

### Gemini Prompt Engineering

The system uses sophisticated prompts optimized for academic analysis:

```python
system_prompt = """
You are an expert research analyst specializing in academic paper
relationship mapping with deep expertise in:

1. CITATION ANALYSIS (HIGHEST PRIORITY)
2. SEMANTIC WORD SIMILARITY
3. GRAPH RELATIONSHIPS
4. METHODOLOGICAL CONNECTIONS

Focus on identifying:
- Direct citation references
- Research lineage and ancestry
- Shared methodologies and concepts
- Knowledge flow patterns
"""
```

## 🌐 API Architecture

### Backend Endpoints

#### 1. Basic Search

**Endpoint**: `POST /search-papers`

- Uses Tavily for basic paper discovery
- Extracts metadata and calculates credibility scores
- Returns enriched paper data

#### 2. Advanced Analysis

**Endpoint**: `POST /search-papers-with-analysis`

- Combines Tavily search with Gemini analysis
- Generates knowledge graph relationships
- Provides semantic connections

#### 3. Enhanced Discovery

**Endpoint**: `POST /discover-papers-with-mapping`

- Full pipeline: Tavily mapping + Gemini analysis
- Discovers 15+ papers minimum
- Maps citation networks and research clusters

### Request/Response Format

```json
// Request
{
  "topic": "deep learning for natural language processing",
  "max_results": 15
}

// Response
{
  "papers": [...],
  "total_found": 18,
  "query": "deep learning for natural language processing",
  "graph_data": {
    "nodes": [...],
    "edges": [...],
    "entity_clusters": [...]
  },
  "mapping_stats": {
    "domains_explored": ["arxiv.org", "ieee.org"],
    "total_urls_discovered": 145,
    "papers_extracted": 18,
    "connections_found": 23
  }
}
```

## 🎨 Frontend Architecture

### Technology Stack

- **Framework**: Next.js 15 with TypeScript
- **UI Components**: React with Tailwind CSS
- **Visualization**: D3.js for interactive graphs
- **State Management**: React hooks

### Key Components

#### 1. Search Interface

```typescript
interface SearchRequest {
  topic: string;
  max_results: number;
}

// Enhanced discovery toggle
const [useMappingMode, setUseMappingMode] = useState(false);
```

#### 2. Graph Visualization

```typescript
interface GraphData {
  nodes: (GraphNode | ThesisNode)[];
  links: GraphLink[];
}

// D3.js force simulation
const simulation = d3
  .forceSimulation(data.nodes)
  .force("link", d3.forceLink(data.links))
  .force("charge", d3.forceManyBody().strength(-400))
  .force("center", d3.forceCenter(width / 2, height / 2));
```

#### 3. Real-time Stats

```typescript
interface Stats {
  paperCount: number;
  avgCredibility: number;
  connectionCount: number;
  avgAccuracy: number;
  highAccuracyConnections: number;
}
```

## 🔄 Complete Workflow

### 1. User Interaction

1. User enters research topic in frontend
2. Selects discovery mode (basic/mapping)
3. Triggers search request to backend

### 2. Backend Processing

1. **FastAPI** receives request
2. **Tavily** discovers academic papers
3. **Gemini** analyzes relationships
4. Results processed and enriched
5. Response sent to frontend

### 3. Frontend Visualization

1. Receives processed data
2. Constructs interactive graph
3. Renders D3.js visualization
4. Updates statistics and metadata

## 🛠️ Setup & Configuration

### Environment Variables

```bash
# Required API Keys
TAVILY_API_KEY=your_tavily_api_key_here
GOOGLE_API_KEY=your_google_api_key_here
```

### Backend Dependencies

```bash
# Install Python dependencies
pip install -r requirements.txt

# Key packages:
# - fastapi: Web framework
# - tavily-python: Tavily API client
# - google-generativeai: Gemini API client
# - uvicorn: ASGI server
```

### Frontend Dependencies

```bash
# Install Node.js dependencies
npm install

# Key packages:
# - next: React framework
# - d3: Graph visualization
# - typescript: Type safety
# - tailwindcss: UI styling
```

### Development Startup

```bash
# Automated development environment
chmod +x run-dev.sh
./run-dev.sh

# Manual startup
# Terminal 1: Backend
cd backend && python start.py

# Terminal 2: Frontend
npm run dev
```

## 🔐 Security & Configuration

### CORS Configuration

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### API Rate Limiting

- Tavily: Built-in rate limiting with delays
- Gemini: Configurable temperature and token limits
- Backend: Implements request batching

## 📊 Performance Optimization

### Batching Strategy

- Papers processed in batches of 8-35
- Similarity pre-filtering reduces API calls
- Parallel processing where possible

### Caching & Fallbacks

- Fallback to hardcoded data if APIs fail
- Credibility scoring for paper ranking
- Minimum paper count guarantees (15+)

## 🔮 Advanced Features

### Citation-Aware Analysis

- Prioritizes citation relationships (5x weight)
- Temporal consistency checking
- Research lineage mapping

### Interactive Visualization

- Force-directed graph layout
- Node coloring by credibility
- Link thickness by relationship strength
- Zoom, pan, and reset controls

### Mapping Statistics

- Domains explored tracking
- Discovery method attribution
- Connection quality metrics

## 🚀 Scaling Considerations

### Horizontal Scaling

- Stateless FastAPI design
- External API dependency management
- Frontend CDN deployment ready

### Monitoring & Observability

- Comprehensive logging
- Error handling and fallbacks
- Performance metrics tracking

---

## 🎯 Quick Start Guide

1. **Clone and Setup**

   ```bash
   git clone [repository]
   cd research-assistant-ai
   ```

2. **Configure Environment**

   ```bash
   export TAVILY_API_KEY="your_key_here"
   export GOOGLE_API_KEY="your_key_here"
   ```

3. **Run Development Environment**

   ```bash
   ./run-dev.sh
   ```

4. **Access Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

The system will automatically handle the complex integration between Tavily's web mapping, Gemini's analysis, and the interactive frontend visualization to provide a seamless research discovery experience.
