# 🚀 Resume.AI: The Ultimate Open-Source Resume Intelligence Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://www.cloudflare.com/)

A privacy-first, powerful AI resume suite optimized for **Cloudflare's Global Network**. Built for job seekers who want elite-level analysis for free, forever.

---

## ✨ Key Features

### 🔍 AI Resume Reviewer
- **Privacy-First Parsing**: PDF/DOCX parsing happens entirely in your browser.
* **ATS Compatibility Score**: Get a detailed 0-100 score across 5 critical categories.
* **Red Flag Detection**: Identify critical issues that get resumes rejected.
* **RAG-Powered Analysis**: Feedback grounded in a knowledge base of 1000+ successful resumes.

### 🎭 Actual ATS Emulator
See your resume through the "eyes" of **Greenhouse, Lever, Workday, and Taleo**.

### 🎯 Job Matcher
- **Semantic Alignment**: Compare your resume against any job description.
* **Keyword Gap Analysis**: Identifies missing concepts, not just words.

### ✍️ Smart Resume Generator
- **Step-by-Step Guidance**: Intuitive form-based builder.
* **AI Bullet Polish**: Convert simple descriptions into achievement statements.
* **Real-time Preview**: See your professional resume take shape as you type.

---

## 🛠 Technical Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, Vite |
| **Backend** | Cloudflare Workers (Hono) |
| **AI Engine** | OpenRouter (LLama 3) |
| **Vector DB** | Pinecone |
| **Hosting** | Cloudflare Pages & Workers |

---

## 🚀 Deployment (100% Free)

### 1. Backend: Cloudflare Workers
The backend is a high-performance Worker built with **Hono**.
1.  Navigate to `backend/`.
2.  Install Wrangler: `npm install -g wrangler`.
3.  Deploy: `wrangler deploy`.
4.  Add your secrets in the Cloudflare Dashboard:
    - `OPENAI_API_KEY`
    - `PINECONE_API_KEY`
    - `PINECONE_INDEX_NAME`

### 2. Frontend: Cloudflare Pages
1.  Connect your GitHub repository to **Cloudflare Pages**.
2.  **Build Command**: `npm run build`
3.  **Output Directory**: `dist`
4.  **Environment Variables**:
    - `VITE_OPENROUTER_API_KEY`: Your OpenRouter key.
    - `VITE_API_URL`: `https://resume-ai-backend.your-subdomain.workers.dev` (Your actual Worker URL)

---

## 🛡 Privacy Guarantee
- ❌ **No** file uploads to our servers.
- ❌ **No** tracking or analytics.
- ❌ **No** accounts required.

---

## 📄 License
Distributed under the **MIT License**.

Built with ❤️ for the developer community.