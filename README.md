# 🚀 Resume.AI: The Ultimate Open-Source Resume Intelligence Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

A privacy-first, powerful AI resume suite that outperforms commercial tools. Built for job seekers who want elite-level analysis without compromising their data.

---

## ✨ Key Features

### 🔍 AI Resume Reviewer
- **Privacy-First Parsing**: PDF/DOCX parsing happens entirely in your browser. Your data never leaves your device.
* **ATS Compatibility Score**: Get a detailed 0-100 score across 5 critical categories.
* **Red Flag Detection**: Identify critical issues that get resumes rejected by human recruiters.
* **RAG-Powered Analysis**: Feedback grounded in a knowledge base of 1000+ successful real-world resumes.

### 🎭 Actual ATS Emulator
See your resume through the "eyes" of the world's most popular systems:
* **Greenhouse, Lever, Workday, and Taleo** emulation.
* Discover exactly what text gets dropped or mangled during parsing.

### 🎯 Job Matcher
- **Semantic Alignment**: Compare your resume against any job description with AI.
* **Keyword Gap Analysis**: Identifies missing concepts, not just missing words.
* **Actionable Suggestions**: Specific advice on how to rewrite sections to match a specific role.

### ✍️ Smart Resume Generator
- **Step-by-Step Guidance**: Intuitive form-based builder for Personal Info, Experience, Education, and Skills.
* **AI Bullet Polish**: Convert simple job descriptions into powerful, quantified achievement statements with one click.
* **Real-time Preview**: See your professional, ATS-optimized resume take shape as you type.
* **One-Click Export**: High-quality PDF generation and clipboard copying.

---

## 🛠 Technical Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | Tailwind CSS (Glassmorphism & Dark Mode) |
| **AI Engine** | OpenRouter (LLama 3), OpenAI (Optional) |
| **Vector DB** | Pinecone (RAG implementation) |
| **Parsing** | pdf.js, mammoth.js (100% Client-side) |
| **Visualization** | Recharts |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- API Keys for OpenRouter (or OpenAI) and Pinecone.

### Installation

1. **Clone & Install**
   ```bash
   git clone https://github.com/your-username/resume-ai.git
   cd resume-ai
   npm install
   ```

2. **Configure Environment**
   Create a `.env` file in the root:
   ```env
   VITE_OPENROUTER_API_KEY=your_key_here
   VITE_PINECONE_API_KEY=your_key_here
   VITE_PINECONE_ENVIRONMENT=your_env
   VITE_PINECONE_INDEX=your_index
   ```

3. **Run Development**
   ```bash
   # Start the backend (proxy)
   cd backend && npm run dev
   
   # Start the frontend (in a new terminal)
   npm run dev
   ```

---

## 🌐 Deployment

### Frontend (Vercel/Netlify)
Deploy the root directory as a static site. Vercel is recommended for the best experience.

### Backend (Render/Railway)
Deploy the `backend` directory as a Node.js web service. Ensure all environment variables are added to the platform's dashboard.

### Production Proxy
The project includes a `vercel.json` to handle API routing in production. Update the destination URL to point to your hosted backend.

---

## 🛡 Privacy Guarantee
We believe your career data is yours alone.
- ❌ **No** file uploads to our servers.
- ❌ **No** tracking or analytics.
- ❌ **No** accounts or emails required.
- ❌ **No** selling your data to recruiters.

---

## 🗺 Roadmap
- [x] LinkedIn Profile Import
- [x] Smart Resume Generator
- [ ] Resume Version Comparison
- [ ] Recruiter Persona Simulation
- [ ] Cover Letter Generator
- [ ] Interview Question Generator

---

## 📄 License
Distributed under the **MIT License**. See `LICENSE` for more information.

Built with ❤️ for the developer community.