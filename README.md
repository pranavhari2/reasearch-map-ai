# Research Assistant AI

A full-stack research assistant tool for computer science grad students that uses **real-time AI-powered search** to find and visualize research papers related to your thesis topic using an interactive knowledge graph.

## Features

- **🔍 Real-time Paper Search**: Uses Tavily AI to find actual research papers from academic sources
- **🗺️ Enhanced Discovery Mode**: Tavily Map traverses academic websites to discover interconnected papers through citation networks, author collaborations, and research clusters
- **🧠 LLM-Powered Analysis**: Gemini 1.5 Pro analyzes papers to identify semantic relationships and connections
- **🎯 Smart Relevance Filtering**: Papers are filtered and scored based on relevance to your topic
- **📊 Interactive Knowledge Graph**: D3.js-powered visualization with force-directed layout
- **🔗 Intelligent Connections**: Papers connect based on LLM-analyzed relationships (builds upon, validates, contradicts, etc.)
- **📈 Live Statistics**: Real-time stats including paper count, credibility scores, and top venues
- **🎮 Interactive Controls**: Drag nodes, zoom, pan, pause/resume simulation
- **🎨 Beautiful Design**: Modern gradient UI with glassmorphism effects
- **🔄 Fallback System**: Gracefully falls back to curated examples if API is unavailable

### Color-coded Credibility:

- 🔴 **Red**: High credibility (8-10) - Top venues like Nature, Science, IEEE
- 🟡 **Yellow**: Medium credibility (5-7) - Good conferences and journals
- 🟢 **Green**: Lower credibility (1-4) - Workshops, preprints
- 🔵 **Blue**: Your thesis topic (center node)

## Tech Stack

### Frontend

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **D3.js** for interactive graph visualization

### Backend

- **FastAPI** for high-performance API
- **Tavily AI** for intelligent research paper search
- **Python 3.8+** with async/await support
- **Pydantic** for data validation

## Getting Started

### Prerequisites

- **Node.js 18+** and npm
- **Python 3.8+** and pip
- **Tavily API Key** (free tier available)
- **Google API Key** (optional, for Gemini LLM analysis)

### Installation

1. **Clone and setup the project:**

```bash
git clone <repository-url>
cd research-assistant-ai
```

2. **Install frontend dependencies:**

```bash
npm install
```

3. **Install backend dependencies:**

```bash
pip install -r requirements.txt
```

4. **Configure API Keys:**

Set your API keys as environment variables:

```bash
export TAVILY_API_KEY="your-actual-tavily-api-key"
export GOOGLE_API_KEY="your-google-api-key"  # Optional for Gemini LLM analysis
```

Or create a `.env` file in the project root:

```env
TAVILY_API_KEY=your-actual-tavily-api-key
GOOGLE_API_KEY=your-google-api-key
```

**Getting API Keys:**

- **Tavily API Key**: Sign up at [Tavily](https://tavily.com/) for research paper search
- **Google API Key**: Get one at [Google AI Studio](https://makersuite.google.com/app/apikey) for Gemini LLM analysis

Note: The Google API key is optional. If not provided, the system will fall back to keyword-based similarity connections.

### Running the Application

#### Option 1: Run both servers manually

**Terminal 1 - Backend API:**

```bash
cd backend
python start.py
```

The API will start at `http://localhost:8000`

**Terminal 2 - Frontend:**

```bash
npm run dev
```

The frontend will start at `http://localhost:3000`

#### Option 2: Development with API docs

1. Start the backend first to see API documentation:

```bash
cd backend && python start.py
```

2. Visit `http://localhost:8000/docs` to explore the API

3. Start the frontend:

```bash
npm run dev
```

4. Visit `http://localhost:3000` to use the application

## Usage

1. **Enter your research topic** (e.g., "Transformer architectures for NLP")
2. **Toggle Enhanced Discovery Mode** (🗺️) for comprehensive paper discovery through academic web mapping
3. **Click "Generate Knowledge Graph"** to search for real papers
4. **Explore the visualization**:
   - Hover over nodes to see paper details
   - Drag nodes to reposition them
   - Use controls to pause/resume, reset layout, or zoom to fit
5. **View statistics** about your search results and mapping discoveries
6. **Click paper nodes** to potentially visit their source URLs

### Enhanced Discovery Mode

When enabled, the system uses **Tavily Map** to intelligently traverse academic websites and discover interconnected papers through:

- **🔗 Citation Networks**: Follows reference chains and related work sections
- **👥 Author Collaborations**: Discovers papers by the same research groups
- **📚 Conference Proceedings**: Explores papers from the same venues and conferences
- **🌐 Academic Databases**: Maps through ArXiv, Google Scholar, IEEE, ACM, and more
- **🧠 Semantic Clustering**: Groups papers by research themes and methodologies

This mode typically discovers **2-3x more relevant papers** than standard search alone!

### Paper Connection Intelligence

The enhanced system now generates **intelligent connections** between papers using:

- **📊 Similarity Analysis**: Compares keywords, authors, venues, and publication years
- **🔗 Citation Networks**: Links papers through Tavily Map traversal
- **👥 Author Collaborations**: Connects papers with shared authors
- **🏛️ Venue Clustering**: Groups papers from the same conferences/journals
- **📈 Relationship Scoring**: Quantifies connection strength (0-1 scale)

**Minimum 15 Papers Guaranteed**: The system ensures you always get at least 15 relevant papers through fallback mechanisms and enhanced search strategies.

## API Endpoints

### `POST /search-papers`

Search for research papers using Tavily AI.

**Request:**

```json
{
  "topic": "machine learning interpretability",
  "max_results": 10
}
```

**Response:**

```json
{
  "papers": [...],
  "total_found": 8,
  "query": "machine learning interpretability"
}
```

### `POST /discover-papers-with-mapping`

🆕 **Enhanced Discovery Mode** - Combines Tavily Search, Map, and LLM analysis for comprehensive paper discovery through academic website traversal.

**Request:**

```json
{
  "topic": "transformer architectures",
  "max_results": 10
}
```

**Response:**

```json
{
  "papers": [...],
  "mapped_papers": [...],
  "total_found": 25,
  "mapping_stats": {
    "domains_explored": ["arxiv.org", "scholar.google.com"],
    "total_urls_discovered": 150,
    "papers_extracted": 12
  },
  "query": "transformer architectures",
  "graph_data": {
    "nodes": [...],
    "edges": [...]
  }
}
```

### `POST /search-papers-with-analysis`

Search for research papers with LLM-powered relationship analysis.

**Request:**

```json
{
  "topic": "transformer architectures",
  "max_results": 10
}
```

**Response:**

```json
{
  "papers": [...],
  "total_found": 8,
  "query": "transformer architectures",
  "graph_data": {
    "nodes": [...],
    "edges": [
      {
        "source": "1",
        "target": "2",
        "relationship_type": "Builds_Upon",
        "strength": 4,
        "description": "Paper 2 extends the transformer architecture introduced in Paper 1"
      }
    ],
    "entity_clusters": [...]
  }
}
```

### `GET /search-papers-simple?topic=your-topic`

Simple GET endpoint for searching papers.

### `GET /health`

Check API health and configuration status.

### `GET /docs`

Interactive API documentation (Swagger UI).

## How It Works

### Backend Intelligence

- **Tavily AI Integration**: Searches academic domains for relevant papers
- **Smart Data Extraction**: Automatically extracts authors, venues, years from content
- **Credibility Scoring**: Calculates scores based on venue reputation and content quality
- **Citation Estimation**: Estimates citation counts based on age and credibility

### Frontend Visualization

- **Relevance Calculation**: Filters papers based on keyword and abstract matching
- **Network Generation**: Creates connections between papers with similar keywords
- **Force Simulation**: Uses D3.js physics for natural node positioning
- **Interactive Features**: Real-time manipulation and exploration

## Customization

### Adding More Academic Sources

Edit `academic_domains` in `backend/main.py`:

```python
academic_domains = [
    "arxiv.org", "semanticscholar.org", "ieee.org",
    "your-institution.edu"  # Add your sources
]
```

### Adjusting Relevance Thresholds

Modify the filtering thresholds in `app/page.tsx`:

```typescript
const relevantPapers = paperNodes.filter((paper) => paper.relevance! > 0.2);
```

### Customizing Credibility Scoring

Update the `calculate_credibility()` function in `backend/main.py` to match your field's venues.

## Example Topics

Try these research topics to see the system in action:

- "Transformer architectures for natural language processing"
- "Graph neural networks for drug discovery"
- "Explainable AI in healthcare"
- "Computer vision for autonomous vehicles"
- "Reinforcement learning for robotics"

## Troubleshooting

### API Connection Issues

- Ensure the backend is running on port 8000
- Check that CORS is properly configured
- Verify your Tavily API key is valid

### No Papers Found

- Try broader or more specific search terms
- Check if Tavily service is available
- The system will fall back to curated examples

### Graph Not Rendering

- Ensure D3.js is properly loaded
- Check browser console for JavaScript errors
- Try refreshing the page

## Future Enhancements

- **🔐 User Authentication**: Save and share research graphs
- **📥 Export Features**: Save graphs as images or datasets
- **🔄 Citation Networks**: Show how papers cite each other
- **🤖 AI Recommendations**: Suggest related papers and research directions
- **👥 Collaboration**: Share graphs with research teams
- **📱 Mobile Support**: Responsive design for tablets and phones

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is for educational and research purposes.
