/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useCallback } from "react";
import { 
  Upload, 
  Image as ImageIcon, 
  Copy, 
  Check, 
  Loader2, 
  RefreshCw,
  Info,
  ShieldCheck,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>("image/jpeg");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [resultPrompt, setResultPrompt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    setMimeType(file.type);
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = (e.target?.result as string).split(",")[1];
      setImage(base64);
      setResultPrompt(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  }, []);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const analyzeImage = async () => {
    if (!image) return;

    setIsAnalyzing(true);
    setError(null);
    setResultPrompt(null);

    try {
      const response = await fetch("/api/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image, mimeType }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Image analysis failed.");

      setResultPrompt(data.prompt);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyToClipboard = () => {
    if (resultPrompt) {
      navigator.clipboard.writeText(resultPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const reset = () => {
    setImage(null);
    setResultPrompt(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-blue-500 selection:text-white relative overflow-hidden" dir="ltr">
      {/* Mesh Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none z-0"></div>

      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/5 backdrop-blur-xl border-b border-white/10 py-4 px-6 sm:px-12 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white shadow-lg">
            <ImageIcon size={24} />
          </div>
          <h1 className="font-bold text-xl tracking-tight hidden sm:block">PixelSense AI</h1>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full text-xs font-medium text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> System Status: Active
          </div>
        </div>
      </header>

      <main className="relative z-10 pt-32 pb-20 px-6 sm:px-12 max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Transform Images into <span className="text-blue-500">AI Prompts</span>
            </h2>
            <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Generate detailed, professional English prompts for image generation tools while keeping identities private.
            </p>
          </motion.div>
        </div>

        {/* Action Cards Area */}
        <div className="grid gap-8 mb-16">
          <AnimatePresence mode="wait">
            {!image ? (
              <motion.div
                key="upload-zone"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onDragOver={onDragOver}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className="bg-white/5 backdrop-blur-xl border-2 border-dashed border-white/10 rounded-[2rem] p-16 flex flex-col items-center justify-center cursor-pointer hover:bg-white/[0.08] hover:border-blue-500/50 transition-all group relative overflow-hidden h-[400px]"
              >
                <div className="absolute inset-0 bg-blue-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-20 h-20 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_40px_rgba(59,130,246,0.1)]">
                  <Upload size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-slate-200">Drop your image here or Click to Browse</h3>
                <p className="text-slate-500">Supports PNG, JPG, WebP up to 10MB</p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept="image/*" 
                />
              </motion.div>
            ) : (
              <motion.div
                key="preview-zone"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden grid md:grid-cols-2 gap-0"
              >
                {/* Image Preview Container */}
                <div className="relative aspect-square md:aspect-auto bg-black/40 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_100%)] from-blue-500/5">
                  <div className="w-full h-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative">
                    <img 
                      src={`data:${mimeType};base64,${image}`} 
                      alt="Preview" 
                      className="w-full h-full object-contain"
                    />
                    {!resultPrompt && !isAnalyzing && (
                      <button 
                        onClick={reset}
                        className="absolute top-4 left-4 bg-white/10 backdrop-blur-md text-white p-2.5 rounded-full hover:bg-white/20 transition-all border border-white/10"
                      >
                        <RefreshCw size={20} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Control Panel / Result Panel */}
                <div className="p-8 md:p-12 flex flex-col justify-center gap-8 bg-white/[0.02]">
                  {!resultPrompt ? (
                    <div className="space-y-8 text-left">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 text-white">
                          <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400">
                            <Zap size={22} />
                          </div>
                          <h4 className="font-bold text-2xl tracking-tight">Smart Analysis</h4>
                        </div>
                        <p className="text-slate-400 text-base leading-relaxed">
                          We will analyze lighting, composition, colors, and art style to generate an optimized prompt.
                        </p>
                      </div>

                      <div className="space-y-4 pt-4 border-t border-white/5">
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-slate-200">Anonymize Features</span>
                            <span className="text-xs text-slate-500">Excludes personal facial details</span>
                          </div>
                          <div className="w-12 h-6 bg-blue-600 rounded-full relative shadow-inner">
                            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-lg"></div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-4">
                        <button 
                          onClick={analyzeImage}
                          disabled={isAnalyzing}
                          className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_30px_rgba(37,99,235,0.3)] group"
                        >
                          {isAnalyzing ? (
                            <>
                              <Loader2 className="animate-spin" size={20} />
                              Processing Image...
                            </>
                          ) : (
                            <>
                              Generate Prompt
                              <Zap size={18} className="group-hover:scale-125 transition-transform" />
                            </>
                          )}
                        </button>

                        <button 
                          onClick={reset}
                          disabled={isAnalyzing}
                          className="w-full py-4 bg-white/5 border border-white/10 text-slate-300 rounded-2xl font-bold hover:bg-white/10 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3 text-emerald-400 bg-emerald-400/10 px-4 py-2 rounded-full border border-emerald-500/20">
                          <Check size={18} />
                          <span className="text-sm font-bold">Ready for Use</span>
                        </div>
                        <div className="flex gap-3">
                          <button 
                            onClick={copyToClipboard}
                            className={`p-3 rounded-xl transition-all border ${copied ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'}`}
                            title="Copy Prompt"
                          >
                            {copied ? <Check size={20} /> : <Copy size={20} />}
                          </button>
                          <button 
                            onClick={reset}
                            className="p-3 bg-white/5 border border-white/10 text-slate-300 rounded-xl hover:bg-white/10 transition-all"
                            title="Reset"
                          >
                            <RefreshCw size={20} />
                          </button>
                        </div>
                      </div>

                      <div className="bg-black/40 p-6 rounded-2xl border border-white/5 min-h-[220px] flex flex-col group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-blue-500/10 transition-colors" />
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[2px]">PROMPT OUTPUT</span>
                          <span className="text-[10px] font-bold text-blue-500 flex items-center gap-1">
                            <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                            AI GENERATED
                          </span>
                        </div>
                        <p className="text-blue-100/90 text-lg leading-relaxed font-mono selection:bg-blue-500/40">
                          "{resultPrompt}"
                        </p>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                          <span className="block text-[8px] uppercase tracking-wider text-slate-500 mb-1">Privacy</span>
                          <span className="text-sm font-semibold text-emerald-400">100%</span>
                        </div>
                        <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                          <span className="block text-[8px] uppercase tracking-wider text-slate-500 mb-1">Accuracy</span>
                          <span className="text-sm font-semibold">High</span>
                        </div>
                        <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                          <span className="block text-[8px] uppercase tracking-wider text-slate-500 mb-1">Style</span>
                          <span className="text-sm font-semibold">Descriptive</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="p-4 bg-red-500/10 text-red-400 rounded-2xl text-sm border border-red-500/20 flex items-start gap-3">
                      <Info size={18} className="shrink-0 mt-0.5" />
                      {error}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* AI Image Generators Links */}
        <div className="mb-20">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px flex-1 bg-white/10"></div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-[3px]">Web-Based Generators</h3>
            <div className="h-px flex-1 bg-white/10"></div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { name: "ChatGPT (DALL-E)", url: "https://chatgpt.com", color: "from-emerald-500/20 to-teal-500/20" },
              { name: "Midjourney", url: "https://www.midjourney.com", color: "from-blue-500/20 to-indigo-500/20" },
              { name: "Runway", url: "https://runwayml.com", color: "from-pink-500/20 to-rose-500/20" },
              { name: "Leonardo.ai", url: "https://leonardo.ai", color: "from-amber-500/20 to-orange-500/20" },
              { name: "ClipDrop", url: "https://clipdrop.co", color: "from-cyan-500/20 to-blue-500/20" },
              { name: "Stable Diffusion", url: "https://stablediffusionweb.com", color: "from-purple-500/20 to-pink-500/20" },
              { name: "Pika Art", url: "https://pika.art", color: "from-slate-500/20 to-gray-500/20" },
              { name: "Adobe Firefly", url: "https://firefly.adobe.com", color: "from-red-500/20 to-orange-500/20" }
            ].map((tool) => (
              <a
                key={tool.name}
                href={tool.url}
                target="_blank"
                rel="noreferrer"
                className={`bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center justify-center text-center text-sm font-medium hover:bg-white/10 transition-all hover:scale-105 active:scale-95 group relative overflow-hidden h-20`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
                <span className="relative z-10">{tool.name}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Features Info */}
        <div className="grid sm:grid-cols-3 gap-8 px-4">
          <div className="bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/5 space-y-4 hover:bg-white/[0.08] transition-colors group">
            <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldCheck size={24} />
            </div>
            <h4 className="font-bold text-lg text-slate-200">Privacy Enforced</h4>
            <p className="text-slate-400 text-sm leading-relaxed">Our AI automatically strips personal identifiers and facial features from prompts to ensure absolute anonymity.</p>
          </div>
          <div className="bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/5 space-y-4 hover:bg-white/[0.08] transition-colors group">
            <div className="w-12 h-12 bg-purple-500/10 text-purple-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Zap size={24} />
            </div>
            <h4 className="font-bold text-lg text-slate-200">Hyper Speed</h4>
            <p className="text-slate-400 text-sm leading-relaxed">Powered by Gemini 3 Flash, get your descriptive prompts in real-time with unparalleled speed and accuracy.</p>
          </div>
          <div className="bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/5 space-y-4 hover:bg-white/[0.08] transition-colors group">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <ImageIcon size={24} />
            </div>
            <h4 className="font-bold text-lg text-slate-200">Expert Quality</h4>
            <p className="text-slate-400 text-sm leading-relaxed">Generated prompts are fine-tuned for high-end platforms like Midjourney, DALL-E 3, and Stable Diffusion.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-12 border-t border-white/5 px-6 sm:px-12 text-center text-slate-500 text-[11px] uppercase tracking-[2px]">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-8 max-w-6xl mx-auto">
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
          <p>© 2026 PixelSense AI • VERSION 4.2.0</p>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
            System Ready
          </div>
        </div>
      </footer>
    </div>
  );
}
