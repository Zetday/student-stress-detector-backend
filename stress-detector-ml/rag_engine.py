"""
RAG Engine for CekTenang — Retrieval-Augmented Generation using scientific papers.

This module handles:
1. PDF extraction from knowledge_base/ using PyMuPDF
2. Text chunking with LangChain's RecursiveCharacterTextSplitter
3. Embedding with sentence-transformers (all-MiniLM-L6-v2)
4. FAISS vector store for similarity search
5. Query building from student activity history
6. Context retrieval for LLM prompt augmentation
"""

import os
from typing import List, Optional
import fitz  # PyMuPDF
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
KNOWLEDGE_BASE_DIR = os.path.join(BASE_DIR, "knowledge_base")
VECTORSTORE_DIR = os.path.join(KNOWLEDGE_BASE_DIR, "vectorstore")

# Embedding model (lightweight, English — suitable for English-language papers)
EMBEDDING_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

# Chunking parameters (optimized for token budget on free Groq tier)
CHUNK_SIZE = 700
CHUNK_OVERLAP = 100
MAX_CHUNK_INJECT = 600  # Safety net: truncate each chunk before injecting into prompt


class RAGEngine:
    """
    Retrieval-Augmented Generation engine backed by FAISS and scientific papers.
    
    Usage:
        engine = RAGEngine()
        query = engine.build_rag_query(history, weekly_stress)
        context = engine.retrieve_context(query, top_k=3)
    """

    def __init__(self, knowledge_base_dir: str = KNOWLEDGE_BASE_DIR):
        self.knowledge_base_dir = knowledge_base_dir
        self.vectorstore_dir = os.path.join(knowledge_base_dir, "vectorstore")
        self.embeddings = HuggingFaceEmbeddings(
            model_name=EMBEDDING_MODEL_NAME,
            model_kwargs={"device": "cpu"},
            encode_kwargs={"normalize_embeddings": True},
        )
        self.vectorstore = self._load_or_build_vectorstore()
        print(f"[RAG] Vectorstore ready with {self.vectorstore.index.ntotal} vectors.")

    # ------------------------------------------------------------------
    # Vectorstore: Load / Build
    # ------------------------------------------------------------------
    def _load_or_build_vectorstore(self) -> FAISS:
        """Load cached FAISS index from disk, or build from PDFs if missing."""
        if os.path.isdir(self.vectorstore_dir):
            try:
                vs = FAISS.load_local(
                    self.vectorstore_dir,
                    self.embeddings,
                    allow_dangerous_deserialization=True,
                )
                print("[RAG] Loaded cached vectorstore from disk.")
                return vs
            except Exception as e:
                print(f"[RAG] Cache load failed ({e}), rebuilding...")

        return self._build_vectorstore()

    def _build_vectorstore(self) -> FAISS:
        """Extract text from PDFs, chunk, embed, and persist to disk."""
        documents = self._extract_pdfs()
        if not documents:
            raise RuntimeError("No documents extracted from knowledge_base/. Check PDF files.")

        chunks = self._chunk_documents(documents)
        print(f"[RAG] Created {len(chunks)} chunks from {len(documents)} pages.")

        vectorstore = FAISS.from_documents(chunks, self.embeddings)

        # Persist to disk for fast reload
        os.makedirs(self.vectorstore_dir, exist_ok=True)
        vectorstore.save_local(self.vectorstore_dir)
        print(f"[RAG] Vectorstore saved to {self.vectorstore_dir}")

        return vectorstore

    # ------------------------------------------------------------------
    # PDF Extraction
    # ------------------------------------------------------------------
    def _extract_pdfs(self) -> List[Document]:
        """Extract text from all PDFs in knowledge_base/ using PyMuPDF."""
        documents: List[Document] = []

        for filename in sorted(os.listdir(self.knowledge_base_dir)):
            if not filename.lower().endswith(".pdf"):
                continue

            filepath = os.path.join(self.knowledge_base_dir, filename)
            try:
                doc = fitz.open(filepath)
                for page_num, page in enumerate(doc, start=1):
                    text = page.get_text("text").strip()
                    if len(text) < 50:
                        # Skip near-empty pages (e.g., cover images)
                        continue
                    documents.append(
                        Document(
                            page_content=text,
                            metadata={
                                "source": filename,
                                "page": page_num,
                            },
                        )
                    )
                doc.close()
                print(f"[RAG] Extracted: {filename} ({page_num} pages)")
            except Exception as e:
                print(f"[RAG] Error extracting {filename}: {e}")

        return documents

    # ------------------------------------------------------------------
    # Text Chunking
    # ------------------------------------------------------------------
    def _chunk_documents(self, documents: List[Document]) -> List[Document]:
        """Split extracted pages into smaller chunks for embedding."""
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=CHUNK_SIZE,
            chunk_overlap=CHUNK_OVERLAP,
            separators=["\n\n", "\n", ". ", " "],
            length_function=len,
        )
        return splitter.split_documents(documents)

    # ------------------------------------------------------------------
    # Context Retrieval
    # ------------------------------------------------------------------
    def retrieve_context(self, query: str, top_k: int = 3) -> str:
        """
        Retrieve the top-k most relevant chunks and format them with SOURCE metadata.
        
        Returns a formatted string ready to inject into the user prompt, e.g.:
        
            [SOURCE: paper_name.pdf]
            "chunk content..."
            
            [SOURCE: another_paper.pdf]
            "chunk content..."
        """
        results = self.vectorstore.similarity_search(query, k=top_k)

        context_parts: List[str] = []
        for doc in results:
            source = doc.metadata.get("source", "Unknown")
            content = doc.page_content[:MAX_CHUNK_INJECT].strip()
            context_parts.append(f'[SOURCE: {source}]\n"{content}"')

        return "\n\n".join(context_parts)

    # ------------------------------------------------------------------
    # Query Building
    # ------------------------------------------------------------------
    @staticmethod
    def build_rag_query(history: list, weekly_stress: str) -> str:
        """
        Build a semantic search query from student activity history and stress prediction.
        
        Analyses 7-day history to detect dominant issues, then composes an English query
        that aligns with the scientific paper corpus.
        
        Args:
            history: List of DailyHistoryItem (or dicts with activity fields).
            weekly_stress: Predicted weekly stress level ("low", "medium", "high").
        
        Returns:
            An English query string for FAISS similarity search.
        """
        query_parts: List[str] = []

        # --- Factor 0: Overall stress level ---
        stress = weekly_stress.lower()
        if stress == "high":
            query_parts.append("high stress intervention coping strategies university students")
        elif stress == "medium":
            query_parts.append("moderate stress management university students")
        else:
            query_parts.append("maintaining low stress wellbeing university students")

        # --- Compute averages from history ---
        def _avg(field: str) -> Optional[float]:
            vals = []
            for day in history:
                v = day.get(field) if isinstance(day, dict) else getattr(day, field, None)
                if v is not None:
                    vals.append(float(v))
            return sum(vals) / len(vals) if vals else None

        avg_sleep = _avg("sleep_hours")
        avg_screen = _avg("screen_time_hours")
        avg_activity = _avg("physical_activity_minutes")
        avg_mood = _avg("mood_score")
        avg_fatigue = _avg("fatigue_level")
        avg_study = _avg("study_hours")
        avg_academic = _avg("academic_pressure_index")

        # --- Factor 1: Sleep deficit ---
        if avg_sleep is not None and avg_sleep < 7:
            query_parts.append("sleep deprivation effects on student stress and academic performance")

        # --- Factor 2: High screen time ---
        if avg_screen is not None and avg_screen > 4:
            query_parts.append("screen time impact on mental health and stress in students")

        # --- Factor 3: Low physical activity ---
        if avg_activity is not None and avg_activity < 20:
            query_parts.append("physical inactivity sedentary behavior stress university students")

        # --- Factor 4: Low mood ---
        if avg_mood is not None and avg_mood < 5:
            query_parts.append("low mood depression academic performance students")

        # --- Factor 5: High fatigue ---
        if avg_fatigue is not None and avg_fatigue > 7:
            query_parts.append("fatigue exhaustion recovery strategies students")

        # --- Factor 6: Academic pressure ---
        if avg_study is not None and avg_study > 7:
            query_parts.append("academic workload stress management strategies")
        if avg_academic is not None and avg_academic >= 0.6:
            query_parts.append("academic pressure impact on student mental health")

        # Combine all parts into a single query
        return " ".join(query_parts)
