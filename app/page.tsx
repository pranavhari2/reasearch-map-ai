"use client";

import { useState, useRef, useEffect } from "react";
import * as d3 from "d3";

interface Paper {
  id: number;
  title: string;
  authors: string[];
  venue: string;
  year: number;
  citations: number;
  credibility: number;
  abstract: string;
  keywords: string[];
  relevance?: number;
}

interface GraphNode extends Paper {
  type: "thesis" | "paper";
  x?: number;
  y?: number;
  fx?: number;
  fy?: number;
}

interface ThesisNode {
  id: string;
  title: string;
  type: "thesis";
  credibility: number;
  x?: number;
  y?: number;
  fx?: number;
  fy?: number;
}

interface GraphLink {
  source: string | number;
  target: string | number;
  strength: number;
}

interface GraphData {
  nodes: (GraphNode | ThesisNode)[];
  links: GraphLink[];
}

interface Stats {
  paperCount: number;
  avgCredibility: number;
  connectionCount: number;
  topVenue: string;
  avgAccuracy: number;
  highAccuracyConnections: number;
  topConnectedPapers: string[];
}

interface LLMEdge {
  source: string;
  target: string;
  relationship_type: string;
  strength: number;
  description: string;
  shared_entities: string[];
}

interface LLMNode {
  id: string;
  title: string;
  authors: string[];
  year: number;
  domain: string;
  key_concepts: string[];
  methods: string[];
  findings: string[];
  abstract_summary: string;
}

interface LLMResponse {
  papers: Paper[];
  total_found: number;
  query: string;
  graph_data: {
    nodes: LLMNode[];
    edges: LLMEdge[];
    entity_clusters: any[];
  };
}

interface MappingStats {
  domains_explored: string[];
  total_urls_discovered: number;
  papers_extracted: number;
  connections_found: number;
  error?: string;
}

interface MappingResponse {
  papers: Paper[];
  mapped_papers: Paper[];
  total_found: number;
  mapping_stats: MappingStats;
  query: string;
  graph_data: {
    nodes: LLMNode[];
    edges: LLMEdge[];
    entity_clusters: any[];
  };
}

const researchPapers: Paper[] = [
  {
    id: 1,
    title: "Attention Is All You Need",
    authors: ["Vaswani, A.", "Shazeer, N.", "Parmar, N."],
    venue: "NIPS",
    year: 2017,
    citations: 85000,
    credibility: 9.8,
    abstract:
      "We propose a new simple network architecture, the Transformer, based solely on attention mechanisms.",
    keywords: ["transformer", "attention", "neural networks", "nlp"],
  },
  {
    id: 2,
    title: "BERT: Pre-training of Deep Bidirectional Transformers",
    authors: ["Devlin, J.", "Chang, M.", "Lee, K."],
    venue: "NAACL",
    year: 2019,
    citations: 65000,
    credibility: 9.5,
    abstract:
      "We introduce BERT, which stands for Bidirectional Encoder Representations from Transformers.",
    keywords: ["bert", "transformer", "pretraining", "nlp", "bidirectional"],
  },
  {
    id: 3,
    title: "GPT-3: Language Models are Few-Shot Learners",
    authors: ["Brown, T.", "Mann, B.", "Ryder, N."],
    venue: "ArXiv",
    year: 2020,
    citations: 45000,
    credibility: 9.2,
    abstract:
      "We train GPT-3, an autoregressive language model with 175 billion parameters.",
    keywords: ["gpt", "language model", "few-shot", "autoregressive", "nlp"],
  },
  {
    id: 4,
    title: "Deep Residual Learning for Image Recognition",
    authors: ["He, K.", "Zhang, X.", "Ren, S."],
    venue: "CVPR",
    year: 2016,
    citations: 120000,
    credibility: 9.7,
    abstract:
      "We present a residual learning framework to ease the training of networks.",
    keywords: ["resnet", "deep learning", "computer vision", "residual"],
  },
  {
    id: 5,
    title: "Generative Adversarial Networks",
    authors: ["Goodfellow, I.", "Pouget-Abadie, J.", "Mirza, M."],
    venue: "NIPS",
    year: 2014,
    citations: 55000,
    credibility: 9.4,
    abstract:
      "We propose a new framework for estimating generative models via an adversarial process.",
    keywords: ["gan", "generative", "adversarial", "deep learning"],
  },
  {
    id: 6,
    title:
      "Neural Machine Translation by Jointly Learning to Align and Translate",
    authors: ["Bahdanau, D.", "Cho, K.", "Bengio, Y."],
    venue: "ICLR",
    year: 2015,
    citations: 35000,
    credibility: 8.9,
    abstract:
      "We conjecture that the use of a fixed-length vector is a bottleneck in improving the performance.",
    keywords: ["neural machine translation", "attention", "alignment", "nlp"],
  },
  {
    id: 7,
    title: "Word2Vec: Efficient Estimation of Word Representations",
    authors: ["Mikolov, T.", "Chen, K.", "Corrado, G."],
    venue: "ArXiv",
    year: 2013,
    citations: 42000,
    credibility: 8.7,
    abstract:
      "We propose two novel model architectures for computing continuous vector representations of words.",
    keywords: ["word2vec", "embeddings", "nlp", "representation learning"],
  },
  {
    id: 8,
    title: "Convolutional Neural Networks for Sentence Classification",
    authors: ["Kim, Y."],
    venue: "EMNLP",
    year: 2014,
    citations: 18000,
    credibility: 7.8,
    abstract:
      "We report on a series of experiments with convolutional neural networks trained on top of pre-trained word vectors.",
    keywords: ["cnn", "sentence classification", "nlp", "text classification"],
  },
  {
    id: 9,
    title: "Long Short-Term Memory Networks",
    authors: ["Hochreiter, S.", "Schmidhuber, J."],
    venue: "Neural Computation",
    year: 1997,
    citations: 75000,
    credibility: 9.1,
    abstract:
      "We introduce Long Short-Term Memory (LSTM), a novel recurrent neural network architecture.",
    keywords: ["lstm", "recurrent", "memory", "sequence modeling"],
  },
  {
    id: 10,
    title: "Dropout: A Simple Way to Prevent Neural Networks from Overfitting",
    authors: ["Srivastava, N.", "Hinton, G.", "Krizhevsky, A."],
    venue: "JMLR",
    year: 2014,
    citations: 32000,
    credibility: 8.5,
    abstract:
      "We show that dropout improves the performance of neural networks on supervised learning tasks.",
    keywords: ["dropout", "regularization", "overfitting", "neural networks"],
  },
];

export default function Home() {
  const [thesisTopic, setThesisTopic] = useState("");
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [stats, setStats] = useState<Stats>({
    paperCount: 0,
    avgCredibility: 0,
    connectionCount: 0,
    topVenue: "-",
    avgAccuracy: 0,
    highAccuracyConnections: 0,
    topConnectedPapers: [],
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [mappingStats, setMappingStats] = useState<MappingStats | null>(null);
  const [useMappingMode, setUseMappingMode] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<
    d3.SimulationNodeDatum,
    undefined
  > | null>(null);

  const calculateRelevance = (
    thesisTopic: string,
    keywords: string[],
    abstract: string
  ): number => {
    const topicWords = thesisTopic.toLowerCase().split(/\s+/);
    const keywordString = keywords.join(" ").toLowerCase();
    const abstractString = abstract.toLowerCase();

    let score = 0;
    topicWords.forEach((word) => {
      if (keywordString.includes(word)) score += 0.3;
      if (abstractString.includes(word)) score += 0.2;
    });

    return Math.min(score, 1.0);
  };

  const calculateSimilarity = (
    keywords1: string[],
    keywords2: string[]
  ): number => {
    const set1 = new Set(keywords1);
    const set2 = new Set(keywords2);
    const intersection = new Set([...set1].filter((x) => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    return intersection.size / union.size;
  };

  const fetchPapersFromAPI = async (
    thesisTopic: string
  ): Promise<{ papers: Paper[]; llmData: LLMResponse["graph_data"] }> => {
    try {
      const response = await fetch(
        "http://localhost:8000/search-papers-with-analysis",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            topic: thesisTopic,
            max_results: 10,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data: LLMResponse = await response.json();
      return {
        papers: data.papers || [],
        llmData: data.graph_data,
      };
    } catch (error) {
      console.error("Failed to fetch papers from API:", error);
      // Fallback to hardcoded data
      const fallbackPapers = researchPapers
        .map((paper) => {
          const relevance = calculateRelevance(
            thesisTopic,
            paper.keywords,
            paper.abstract
          );
          return { ...paper, relevance };
        })
        .filter((paper) => paper.relevance! > 0.3);

      return {
        papers: fallbackPapers,
        llmData: { nodes: [], edges: [], entity_clusters: [] },
      };
    }
  };

  const fetchPapersWithMapping = async (
    thesisTopic: string
  ): Promise<{
    papers: Paper[];
    llmData: LLMResponse["graph_data"];
    mappingStats: MappingStats;
  }> => {
    try {
      const response = await fetch(
        "http://localhost:8000/discover-papers-with-mapping",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            topic: thesisTopic,
            max_results: 10,
          }),
        }
      );

      if (!response.ok) {
        // If endpoint doesn't exist (404), show specific error
        if (response.status === 404) {
          throw new Error(
            `Mapping endpoint not found. Please restart the backend server.`
          );
        }
        throw new Error(`API Error: ${response.status}`);
      }

      const data: MappingResponse = await response.json();

      // Combine original papers with mapped papers
      const allPapers = [...(data.papers || []), ...(data.mapped_papers || [])];

      return {
        papers: allPapers,
        llmData: data.graph_data,
        mappingStats: data.mapping_stats,
      };
    } catch (error) {
      console.error("Failed to fetch papers with mapping:", error);

      // Show user-friendly error message
      const errorMessage =
        error instanceof Error ? error.message : "Mapping failed";

      // Fallback to regular API
      const fallbackResult = await fetchPapersFromAPI(thesisTopic);
      return {
        ...fallbackResult,
        mappingStats: {
          domains_explored: [],
          total_urls_discovered: 0,
          papers_extracted: 0,
          connections_found: 0,
          error: errorMessage,
        },
      };
    }
  };

  const createGraphData = async (thesisTopic: string): Promise<GraphData> => {
    const thesisNode: ThesisNode = {
      id: "thesis",
      title: thesisTopic,
      type: "thesis",
      credibility: 10,
      x: 400,
      y: 300,
    };

    // Fetch papers from API with LLM analysis (with or without mapping)
    let apiPapers: Paper[];
    let llmData: LLMResponse["graph_data"];

    if (useMappingMode) {
      const result = await fetchPapersWithMapping(thesisTopic);
      apiPapers = result.papers;
      llmData = result.llmData;
      setMappingStats(result.mappingStats);
    } else {
      const result = await fetchPapersFromAPI(thesisTopic);
      apiPapers = result.papers;
      llmData = result.llmData;
      setMappingStats(null);
    }

    const paperNodes: GraphNode[] = apiPapers.map((paper, index) => {
      const relevance = calculateRelevance(
        thesisTopic,
        paper.keywords,
        paper.abstract
      );
      return {
        ...paper,
        id: index + 1, // Ensure unique IDs
        type: "paper",
        relevance: relevance,
      };
    });

    const relevantPapers = paperNodes.filter((paper) => paper.relevance! > 0.2); // Lower threshold for API results
    const links: GraphLink[] = [];

    // Add thesis-to-paper connections
    relevantPapers.forEach((paper) => {
      links.push({
        source: "thesis",
        target: paper.id,
        strength: paper.relevance!,
      });
    });

    // Use LLM-generated connections if available
    if (llmData && llmData.edges && llmData.edges.length > 0) {
      llmData.edges.forEach((edge) => {
        const sourceId = parseInt(edge.source);
        const targetId = parseInt(edge.target);

        // Find matching papers in our paperNodes
        const sourceExists = relevantPapers.some((p) => p.id === sourceId);
        const targetExists = relevantPapers.some((p) => p.id === targetId);

        if (sourceExists && targetExists) {
          links.push({
            source: sourceId,
            target: targetId,
            strength: edge.strength / 5, // Normalize strength to 0-1 range
          });
        }
      });
    } else {
      // Fallback to similarity-based connections
      for (let i = 0; i < relevantPapers.length; i++) {
        for (let j = i + 1; j < relevantPapers.length; j++) {
          const similarity = calculateSimilarity(
            relevantPapers[i].keywords,
            relevantPapers[j].keywords
          );
          if (similarity > 0.3) {
            links.push({
              source: relevantPapers[i].id,
              target: relevantPapers[j].id,
              strength: similarity,
            });
          }
        }
      }
    }

    return {
      nodes: [thesisNode, ...relevantPapers],
      links: links,
    };
  };

  const getNodeColor = (node: GraphNode | ThesisNode): string => {
    if (node.type === "thesis") return "url(#thesisGradient)";

    const paper = node as GraphNode;
    if (paper.credibility >= 8) return "url(#highCredibilityGradient)";
    if (paper.credibility >= 5) return "url(#mediumCredibilityGradient)";
    return "url(#lowCredibilityGradient)";
  };

  const getLinkColor = (strength: number): string => {
    if (strength >= 0.8) return "#10B981"; // High accuracy - emerald
    if (strength >= 0.6) return "#F59E0B"; // Medium accuracy - amber
    if (strength >= 0.4) return "#EF4444"; // Low accuracy - red
    return "#6B7280"; // Very low accuracy - gray
  };

  const getLinkWidth = (strength: number): number => {
    return Math.max(2, strength * 8); // Minimum 2px, maximum 8px
  };

  const isHighlyConnected = (nodeId: string | number): boolean => {
    const id = typeof nodeId === "string" ? nodeId : nodeId.toString();
    return stats.topConnectedPapers.includes(id);
  };

  const getAccuracyColor = (strength: number): string => {
    if (strength >= 0.8) return "#10B981"; // High accuracy - emerald
    if (strength >= 0.6) return "#F59E0B"; // Medium accuracy - amber
    return "#EF4444"; // Low accuracy - red
  };

  const getAccuracyLabel = (strength: number): string => {
    if (strength >= 0.8) return "High Accuracy";
    if (strength >= 0.6) return "Medium Accuracy";
    return "Low Accuracy";
  };

  const getTooltipContent = (node: GraphNode | ThesisNode): string => {
    if (node.type === "thesis") {
      return `<div style="text-align: center; font-weight: bold; color: #1E40AF; font-size: 14px;">
        🎯 Thesis Topic<br/><br/>
        <span style="color: #1f2937; font-size: 13px;">${node.title}</span>
      </div>`;
    }

    const paper = node as GraphNode;
    const highlyConnected = isHighlyConnected(paper.id);
    return `<div style="line-height: 1.6;">
      <div style="font-weight: bold; color: #1E40AF; margin-bottom: 8px; font-size: 14px;">
        ${highlyConnected ? "⭐ " : "📄 "}${paper.title}
      </div>
      <div style="margin-bottom: 6px;"><strong>Authors:</strong> ${paper.authors.join(
        ", "
      )}</div>
      <div style="margin-bottom: 6px;"><strong>Venue:</strong> ${
        paper.venue
      } (${paper.year})</div>
      <div style="margin-bottom: 6px;"><strong>Citations:</strong> ${paper.citations.toLocaleString()}</div>
      <div style="margin-bottom: 6px;"><strong>Credibility:</strong> <span style="color: ${
        paper.credibility >= 8
          ? "#EF4444"
          : paper.credibility >= 5
          ? "#EAB308"
          : "#22C55E"
      }; font-weight: bold;">${paper.credibility}/10</span></div>
      <div style="margin-bottom: 6px;"><strong>Relevance:</strong> ${(
        (paper.relevance || 0) * 100
      ).toFixed(1)}%</div>
      ${
        highlyConnected
          ? '<div style="margin-bottom: 6px; color: #F59E0B; font-weight: bold; font-size: 12px;">🔗 HIGHLY CONNECTED PAPER</div>'
          : ""
      }
      <div style="font-size: 12px; color: #64748b;"><strong>Keywords:</strong> ${paper.keywords.join(
        ", "
      )}</div>
    </div>`;
  };

  const updateStats = (data: GraphData) => {
    const papers = data.nodes.filter((n) => n.type === "paper") as GraphNode[];
    const avgCredibility =
      papers.reduce((sum, p) => sum + p.credibility, 0) / papers.length;
    const venueCount: { [key: string]: number } = {};
    papers.forEach(
      (p) => (venueCount[p.venue] = (venueCount[p.venue] || 0) + 1)
    );
    const topVenue = Object.keys(venueCount).reduce(
      (a, b) => (venueCount[a] > venueCount[b] ? a : b),
      "-"
    );

    // Calculate connection degree for each paper
    const connectionDegree: { [key: string]: number } = {};
    papers.forEach((p) => (connectionDegree[p.id] = 0));

    data.links.forEach((link) => {
      const sourceId =
        typeof link.source === "string" ? link.source : link.source.toString();
      const targetId =
        typeof link.target === "string" ? link.target : link.target.toString();
      if (connectionDegree[sourceId] !== undefined)
        connectionDegree[sourceId]++;
      if (connectionDegree[targetId] !== undefined)
        connectionDegree[targetId]++;
    });

    // Find top connected papers
    const topConnectedPapers = Object.entries(connectionDegree)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id, _]) => id);

    // Calculate accuracy metrics from link strengths
    const linkStrengths = data.links.map((link) => link.strength);
    const avgAccuracy =
      linkStrengths.length > 0
        ? linkStrengths.reduce((sum, strength) => sum + strength, 0) /
          linkStrengths.length
        : 0;
    const highAccuracyConnections = linkStrengths.filter(
      (strength) => strength >= 0.7
    ).length;

    setStats({
      paperCount: papers.length,
      avgCredibility: parseFloat(avgCredibility.toFixed(1)),
      connectionCount: data.links.length,
      topVenue: topVenue,
      avgAccuracy: parseFloat((avgAccuracy * 100).toFixed(1)),
      highAccuracyConnections: highAccuracyConnections,
      topConnectedPapers: topConnectedPapers,
    });
  };

  const renderGraph = (data: GraphData) => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 800;
    const height = 600;

    // Add gradients for nodes
    const defs = svg.append("defs");

    // Thesis node gradient
    const thesisGradient = defs
      .append("radialGradient")
      .attr("id", "thesisGradient");
    thesisGradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#60A5FA");
    thesisGradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#3B82F6");

    // High credibility gradient
    const highGradient = defs
      .append("radialGradient")
      .attr("id", "highCredibilityGradient");
    highGradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#FCA5A5");
    highGradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#EF4444");

    // Medium credibility gradient
    const mediumGradient = defs
      .append("radialGradient")
      .attr("id", "mediumCredibilityGradient");
    mediumGradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#FDE047");
    mediumGradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#EAB308");

    // Low credibility gradient
    const lowGradient = defs
      .append("radialGradient")
      .attr("id", "lowCredibilityGradient");
    lowGradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#86EFAC");
    lowGradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#22C55E");

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        g.attr("transform", event.transform.toString());
      });

    svg.call(zoom);

    const g = svg.append("g");

    const simulation = d3
      .forceSimulation(data.nodes as d3.SimulationNodeDatum[])
      .force(
        "link",
        d3
          .forceLink(data.links)
          .id((d: any) => d.id)
          .distance(120)
      )
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(35));

    simulationRef.current = simulation;

    // Enhanced links with better styling
    const link = g
      .append("g")
      .selectAll("line")
      .data(data.links)
      .enter()
      .append("line")
      .attr("stroke", (d: any) => getLinkColor(d.strength))
      .attr("stroke-opacity", 0.8)
      .attr("stroke-width", (d: any) => getLinkWidth(d.strength))
      .attr("stroke-linecap", "round")
      .style("filter", "drop-shadow(0px 1px 2px rgba(0,0,0,0.1))");

    const node = g
      .append("g")
      .selectAll("circle")
      .data(data.nodes)
      .enter()
      .append("circle")
      .attr("r", (d: any) => {
        if (d.type === "thesis") return 28;
        return isHighlyConnected(d.id) ? 22 : 18;
      })
      .attr("fill", (d: any) => getNodeColor(d))
      .attr("stroke", (d: any) => {
        if (d.type === "thesis") return "#1E40AF";
        return isHighlyConnected(d.id) ? "#F59E0B" : "#374151";
      })
      .attr("stroke-width", (d: any) => {
        if (d.type === "thesis") return 3;
        return isHighlyConnected(d.id) ? 4 : 2;
      })
      .style("cursor", "pointer")
      .style("filter", (d: any) => {
        if (d.type === "thesis")
          return "drop-shadow(0px 2px 4px rgba(0,0,0,0.15))";
        return isHighlyConnected(d.id)
          ? "drop-shadow(0px 3px 6px rgba(245, 158, 11, 0.3)) drop-shadow(0px 0px 12px rgba(245, 158, 11, 0.2))"
          : "drop-shadow(0px 2px 4px rgba(0,0,0,0.15))";
      })
      .style("transition", "all 0.2s ease")
      .on("mouseenter", function (event: any, d: any) {
        const baseRadius =
          d.type === "thesis" ? 28 : isHighlyConnected(d.id) ? 22 : 18;
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", baseRadius + 4)
          .style("filter", (d: any) => {
            if (d.type === "thesis")
              return "drop-shadow(0px 4px 8px rgba(0,0,0,0.25))";
            return isHighlyConnected(d.id)
              ? "drop-shadow(0px 4px 12px rgba(245, 158, 11, 0.4)) drop-shadow(0px 0px 16px rgba(245, 158, 11, 0.3))"
              : "drop-shadow(0px 4px 8px rgba(0,0,0,0.25))";
          });
      })
      .on("mouseleave", function (event: any, d: any) {
        const baseRadius =
          d.type === "thesis" ? 28 : isHighlyConnected(d.id) ? 22 : 18;
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", baseRadius)
          .style("filter", (d: any) => {
            if (d.type === "thesis")
              return "drop-shadow(0px 2px 4px rgba(0,0,0,0.15))";
            return isHighlyConnected(d.id)
              ? "drop-shadow(0px 3px 6px rgba(245, 158, 11, 0.3)) drop-shadow(0px 0px 12px rgba(245, 158, 11, 0.2))"
              : "drop-shadow(0px 2px 4px rgba(0,0,0,0.15))";
          });
      })
      .call(
        d3
          .drag<SVGCircleElement, any>()
          .on(
            "start",
            (event: d3.D3DragEvent<SVGCircleElement, any, any>, d: any) => {
              if (!event.active) simulation.alphaTarget(0.3).restart();
              d.fx = d.x;
              d.fy = d.y;
            }
          )
          .on(
            "drag",
            (event: d3.D3DragEvent<SVGCircleElement, any, any>, d: any) => {
              d.fx = event.x;
              d.fy = event.y;
            }
          )
          .on(
            "end",
            (event: d3.D3DragEvent<SVGCircleElement, any, any>, d: any) => {
              if (!event.active) simulation.alphaTarget(0);
              d.fx = null;
              d.fy = null;
            }
          )
      );

    const labels = g
      .append("g")
      .selectAll("text")
      .data(data.nodes)
      .enter()
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .style("font-size", (d: any) => (d.type === "thesis" ? "13px" : "11px"))
      .style("font-weight", (d: any) => (d.type === "thesis" ? "bold" : "500"))
      .style("fill", (d: any) => (d.type === "thesis" ? "#1E40AF" : "#374151"))
      .style("pointer-events", "none")
      .style("text-shadow", "0px 1px 2px rgba(255,255,255,0.8)")
      .text((d: any) =>
        d.type === "thesis" ? d.title : d.title.substring(0, 18) + "..."
      );

    // Tooltip
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("background", "rgba(255, 255, 255, 0.98)")
      .style("color", "#1f2937")
      .style("padding", "16px")
      .style("border-radius", "12px")
      .style("font-size", "13px")
      .style("font-weight", "500")
      .style("line-height", "1.5")
      .style("pointer-events", "none")
      .style("z-index", "1000")
      .style("max-width", "320px")
      .style(
        "box-shadow",
        "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
      )
      .style("border", "1px solid rgba(0, 0, 0, 0.1)")
      .style("backdrop-filter", "blur(10px)")
      .style("opacity", 0);

    node
      .on("mouseover", (event: MouseEvent, d: any) => {
        tooltip.transition().duration(200).style("opacity", 0.95);
        tooltip
          .html(getTooltipContent(d))
          .style("left", event.pageX + 15 + "px")
          .style("top", event.pageY - 10 + "px");
      })
      .on("mouseout", () => {
        tooltip.transition().duration(300).style("opacity", 0);
      });

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node.attr("cx", (d: any) => d.x).attr("cy", (d: any) => d.y);

      labels.attr("x", (d: any) => d.x).attr("y", (d: any) => d.y + 5);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!thesisTopic.trim()) return;

    setIsSubmitted(true);

    try {
      const data = await createGraphData(thesisTopic);
      setGraphData(data);
      updateStats(data);
    } catch (error) {
      console.error("Failed to create graph data:", error);
      setIsSubmitted(false);
    }
  };

  const handleReset = () => {
    setThesisTopic("");
    setGraphData(null);
    setIsSubmitted(false);
    setStats({
      paperCount: 0,
      avgCredibility: 0,
      connectionCount: 0,
      topVenue: "-",
      avgAccuracy: 0,
      highAccuracyConnections: 0,
      topConnectedPapers: [],
    });
  };

  const toggleSimulation = () => {
    if (simulationRef.current) {
      const alpha = simulationRef.current.alpha();
      if (alpha > 0) {
        simulationRef.current.stop();
      } else {
        simulationRef.current.restart();
      }
    }
  };

  const resetGraphLayout = () => {
    if (simulationRef.current) {
      simulationRef.current.nodes().forEach((d: any) => {
        d.fx = null;
        d.fy = null;
      });
      simulationRef.current.alpha(1).restart();
    }
  };

  const zoomFit = () => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      const bounds = (svg.node() as SVGSVGElement).getBBox();
      const width = 800;
      const height = 600;
      const midX = bounds.x + bounds.width / 2;
      const midY = bounds.y + bounds.height / 2;
      const scale =
        0.8 / Math.max(bounds.width / width, bounds.height / height);
      const translate = [width / 2 - scale * midX, height / 2 - scale * midY];

      svg
        .transition()
        .duration(750)
        .call(
          d3.zoom<SVGSVGElement, unknown>().transform,
          d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
        );
    }
  };

  useEffect(() => {
    if (graphData) {
      renderGraph(graphData);
    }
  }, [graphData]);

  // Removed auto-initialization - users start with empty interface

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-6 shadow-xl">
            <span className="text-3xl">🔬</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-4">
            AI Research Assistant
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Discover intelligent connections between AI research papers and your
            thesis topic through advanced mapping and analysis
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-white/20 p-8 mb-12">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Main Search Input */}
            <div className="relative">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={thesisTopic}
                    onChange={(e) => setThesisTopic(e.target.value)}
                    placeholder="Enter your research topic (e.g., 'Deep Learning for NLP', 'Computer Vision', 'Reinforcement Learning')"
                    className="w-full px-6 py-4 text-lg bg-white border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 shadow-sm"
                    required
                  />
                  <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                    <span className="text-slate-400 text-xl">🎯</span>
                  </div>
                  <style jsx>{`
                    input {
                      padding-left: 3.5rem;
                    }
                  `}</style>
                </div>
                <button
                  type="submit"
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg font-semibold text-lg flex items-center gap-2"
                >
                  <span>🔍</span>
                  Generate Graph
                </button>
              </div>
            </div>

            {/* Enhanced Discovery Toggle */}
            <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-200/50">
              <div className="flex items-start gap-4">
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useMappingMode}
                      onChange={(e) => setUseMappingMode(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-12 h-6 bg-slate-300 peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-purple-500"></div>
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🗺️</span>
                    <span className="text-lg font-semibold text-slate-800">
                      Enhanced Discovery Mode
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-slate-600 leading-relaxed">
                    Uses advanced Tavily Map technology to traverse academic
                    websites and discover interconnected papers through{" "}
                    <strong>citation networks</strong>,{" "}
                    <strong>author collaborations</strong>, and{" "}
                    <strong>research clusters</strong>. Typically finds 2-3x
                    more relevant papers.
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Graph Container */}
        {graphData && (
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-lg border border-white/20 overflow-hidden">
            {/* Graph Header */}
            <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-8 py-6 border-b border-slate-200/50">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
                    Knowledge Graph
                  </h3>
                  <p className="text-slate-600">
                    Interactive visualization of research paper connections
                  </p>
                </div>
                <div className="bg-white/60 rounded-2xl p-4 border border-slate-200/50">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gradient-to-br from-red-400 to-red-500 rounded-full shadow-sm"></div>
                        <span className="text-slate-700 font-medium">
                          High Credibility (8-10)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full shadow-sm"></div>
                        <span className="text-slate-700 font-medium">
                          Medium Credibility (5-7)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full shadow-sm"></div>
                        <span className="text-slate-700 font-medium">
                          Low Credibility (1-4)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-sm"></div>
                        <span className="text-slate-700 font-medium">
                          Thesis Topic
                        </span>
                      </div>
                    </div>
                    <div className="border-t border-slate-200 pt-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-amber-500 rounded-full bg-white shadow-sm"></div>
                          <span className="text-slate-700 font-medium">
                            Highly Connected
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-1 bg-emerald-500 rounded-full shadow-sm"></div>
                          <span className="text-slate-700 font-medium">
                            High Accuracy Links
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-1 bg-amber-500 rounded-full shadow-sm"></div>
                          <span className="text-slate-700 font-medium">
                            Medium Accuracy Links
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-1 bg-red-500 rounded-full shadow-sm"></div>
                          <span className="text-slate-700 font-medium">
                            Low Accuracy Links
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="px-8 py-4 bg-slate-50/50 border-b border-slate-200/50">
              <div className="flex gap-3">
                <button
                  onClick={toggleSimulation}
                  className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all duration-200 text-slate-700 font-medium hover:shadow-sm flex items-center gap-2"
                >
                  <span>⏯️</span>
                  Pause/Resume
                </button>
                <button
                  onClick={resetGraphLayout}
                  className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all duration-200 text-slate-700 font-medium hover:shadow-sm flex items-center gap-2"
                >
                  <span>🔄</span>
                  Reset Layout
                </button>
                <button
                  onClick={zoomFit}
                  className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all duration-200 text-slate-700 font-medium hover:shadow-sm flex items-center gap-2"
                >
                  <span>🔍</span>
                  Zoom to Fit
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-xl transition-all duration-200 font-medium hover:shadow-sm flex items-center gap-2"
                >
                  <span>🗑️</span>
                  Clear All
                </button>
              </div>
            </div>

            {/* Graph */}
            <div className="relative bg-gradient-to-br from-slate-50 to-blue-50/30 p-8">
              <div className="bg-white rounded-2xl shadow-inner border border-slate-200/50 overflow-hidden">
                <svg
                  ref={svgRef}
                  width="800"
                  height="600"
                  viewBox="0 0 800 600"
                  className="w-full h-auto bg-gradient-to-br from-white to-slate-50/50"
                />
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-slate-50/50 p-8 border-t border-slate-200/50">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-slate-200/50 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <span className="text-white text-lg font-bold">📄</span>
                  </div>
                  <div className="text-3xl font-bold text-slate-800 mb-1">
                    {stats.paperCount}
                  </div>
                  <div className="text-slate-600 font-medium">
                    Research Papers
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-slate-200/50 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <span className="text-white text-lg font-bold">⭐</span>
                  </div>
                  <div className="text-3xl font-bold text-slate-800 mb-1">
                    {stats.avgCredibility}
                  </div>
                  <div className="text-slate-600 font-medium">
                    Avg Credibility
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-slate-200/50 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <span className="text-white text-lg font-bold">🔗</span>
                  </div>
                  <div className="text-3xl font-bold text-slate-800 mb-1">
                    {stats.connectionCount}
                  </div>
                  <div className="text-slate-600 font-medium">Connections</div>
                </div>
                <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-slate-200/50 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <span className="text-white text-lg font-bold">🏆</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-800 mb-1 truncate">
                    {stats.topVenue}
                  </div>
                  <div className="text-slate-600 font-medium">Top Venue</div>
                </div>
                <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-slate-200/50 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <span className="text-white text-lg font-bold">🎯</span>
                  </div>
                  <div className="text-3xl font-bold text-slate-800 mb-1">
                    {stats.avgAccuracy}%
                  </div>
                  <div className="text-slate-600 font-medium">
                    Link Accuracy
                  </div>
                </div>
              </div>

              {/* Connection Analysis */}
              <div className="mt-8 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-200/50">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center">
                    <span className="text-white text-lg">🔍</span>
                  </div>
                  <h4 className="text-xl font-bold text-slate-800">
                    Connection Analysis
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white/70 rounded-xl p-4 border border-white/50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-slate-700">
                        High Accuracy Links
                      </span>
                      <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    </div>
                    <div className="text-2xl font-bold text-emerald-700">
                      {stats.highAccuracyConnections}
                    </div>
                    <div className="text-sm text-slate-600">
                      {stats.connectionCount > 0
                        ? Math.round(
                            (stats.highAccuracyConnections /
                              stats.connectionCount) *
                              100
                          )
                        : 0}
                      % of total connections
                    </div>
                  </div>
                  <div className="bg-white/70 rounded-xl p-4 border border-white/50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-slate-700">
                        Top Connected Papers
                      </span>
                      <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                    </div>
                    <div className="text-2xl font-bold text-amber-700">
                      {stats.topConnectedPapers.length}
                    </div>
                    <div className="text-sm text-slate-600">
                      Papers with most connections
                    </div>
                  </div>
                  <div className="bg-white/70 rounded-xl p-4 border border-white/50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-slate-700">
                        Network Density
                      </span>
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    </div>
                    <div className="text-2xl font-bold text-blue-700">
                      {stats.paperCount > 1
                        ? Math.round(
                            (stats.connectionCount /
                              ((stats.paperCount * (stats.paperCount - 1)) /
                                2)) *
                              100
                          )
                        : 0}
                      %
                    </div>
                    <div className="text-sm text-slate-600">
                      Graph connectivity level
                    </div>
                  </div>
                </div>
              </div>

              {/* Mapping Statistics */}
              {mappingStats && (
                <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200/50">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <span className="text-white text-lg">🗺️</span>
                    </div>
                    <h4 className="text-xl font-bold text-slate-800">
                      Enhanced Discovery Results
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white/70 rounded-xl p-4 text-center border border-white/50">
                      <div className="text-2xl font-bold text-blue-700 mb-1">
                        {mappingStats.domains_explored.length}
                      </div>
                      <div className="text-sm text-blue-600 font-medium mb-2">
                        Domains Explored
                      </div>
                      {mappingStats.domains_explored.length > 0 && (
                        <div className="text-xs text-slate-500">
                          {mappingStats.domains_explored.slice(0, 2).join(", ")}
                          {mappingStats.domains_explored.length > 2 && "..."}
                        </div>
                      )}
                    </div>
                    <div className="bg-white/70 rounded-xl p-4 text-center border border-white/50">
                      <div className="text-2xl font-bold text-blue-700 mb-1">
                        {mappingStats.total_urls_discovered}
                      </div>
                      <div className="text-sm text-blue-600 font-medium">
                        URLs Discovered
                      </div>
                    </div>
                    <div className="bg-white/70 rounded-xl p-4 text-center border border-white/50">
                      <div className="text-2xl font-bold text-blue-700 mb-1">
                        {mappingStats.papers_extracted}
                      </div>
                      <div className="text-sm text-blue-600 font-medium">
                        Papers Extracted
                      </div>
                    </div>
                    <div className="bg-white/70 rounded-xl p-4 text-center border border-white/50">
                      <div className="text-2xl font-bold text-blue-700 mb-1">
                        {mappingStats.connections_found}
                      </div>
                      <div className="text-sm text-blue-600 font-medium">
                        Paper Connections
                      </div>
                    </div>
                  </div>
                  {mappingStats.error && (
                    <div className="mt-4 text-sm text-red-700 bg-red-50 p-4 rounded-xl border border-red-200">
                      <div className="flex items-center gap-2">
                        <span>⚠️</span>
                        <span className="font-medium">
                          {mappingStats.error}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 text-slate-500 text-sm">
            <span>Powered by</span>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-blue-600">Tavily AI</span>
              <span>•</span>
              <span className="font-semibold text-purple-600">
                Gemini 1.5 Pro
              </span>
              <span>•</span>
              <span className="font-semibold text-emerald-600">D3.js</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
