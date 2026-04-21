import { useState, useCallback } from 'react';
import { Sparkles, Download, ChevronRight, ChevronLeft, User, Briefcase, GraduationCap, Wrench, FileText, Loader2, Plus, Copy, Check, FileDown } from 'lucide-react';
import { createChatCompletion } from '../../lib/pinecone';
import html2pdf from 'html2pdf.js';
import LinkedInImport from '../ui/LinkedInImport';

const steps = [
  { id: 'personal', label: 'Personal Info', icon: User },
  { id: 'experience', label: 'Experience', icon: Briefcase },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'skills', label: 'Skills', icon: Wrench },
  { id: 'preview', label: 'Preview', icon: FileText },
];

export default function ResumeGenerator() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    personal: { name: '', email: '', phone: '', location: '', linkedin: '', summary: '' },
    experience: [] as any[],
    education: [] as any[],
    skills: [] as string[],
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingIndex, setGeneratingIndex] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleLinkedInImport = (data: any) => {
    setFormData({
      ...formData,
      personal: {
        ...formData.personal,
        name: data.name || '',
        location: data.location || ''
      },
      experience: data.experience || []
    });
    setCurrentStep(1);
  };

  const addExperience = useCallback(() => {
    setFormData({
      ...formData,
      experience: [...formData.experience, { title: '', company: '', location: '', startDate: '', endDate: '', description: '', generatedBullets: '' }]
    });
  }, [formData]);

  const addEducation = useCallback(() => {
    setFormData({
      ...formData,
      education: [...formData.education, { institution: '', degree: '', field: '', graduationDate: '', gpa: '' }]
    });
  }, [formData]);

  const generateBulletPoints = async (index: number) => {
    const exp = formData.experience[index];
    if (!exp.description) return;

    setIsGenerating(true);
    setGeneratingIndex(index);
    try {
      const response = await createChatCompletion([
        {
          role: 'system',
          content: 'You are an expert resume writer. Convert this job description into 3-5 powerful, quantified, achievement-focused bullet points. Use action verbs and include metrics where possible. Make each bullet start with a strong action verb.'
        },
        {
          role: 'user',
          content: `Title: ${exp.title}, Company: ${exp.company}. Description: ${exp.description}`
        }
      ], {
        temperature: 0.7
      });

      const newExperience = [...formData.experience];
      newExperience[index].generatedBullets = response.choices[0].message.content;
      setFormData({ ...formData, experience: newExperience });
    } finally {
      setIsGenerating(false);
      setGeneratingIndex(null);
    }
  };

  const updateExperience = (index: number, field: string, value: string) => {
    const newExperience = [...formData.experience];
    newExperience[index][field] = value;
    setFormData({ ...formData, experience: newExperience });
  };

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      const element = document.getElementById('resume-preview');
      if (element) {
        const opt = {
          margin: 0.5,
          filename: `${formData.personal.name || 'resume'}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };
        await html2pdf().set(opt).from(element).save();
      }
    } finally {
      setIsExporting(false);
    }
  };

  const copyToClipboard = () => {
    const resumeText = document.getElementById('resume-preview')?.innerText;
    if (resumeText) {
      navigator.clipboard.writeText(resumeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-reveal">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-3">Resume Generator</h2>
        <p className="text-lg opacity-60">Build a professional resume with AI-powered bullet points</p>
      </div>

      {/* Step Progress */}
      <div className="flex justify-center mb-12">
        <div className="flex items-center gap-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => setCurrentStep(index)}
                className={`flex items-center gap-3 p-4 rounded-xl transition-all ${
                  currentStep === index 
                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' 
                    : currentStep > index 
                    ? 'bg-green-500 text-white' 
                    : 'bg-black/5 opacity-50'
                }`}
              >
                <step.icon className="w-5 h-5" />
                <span className="font-medium hidden sm:inline">{step.label}</span>
              </button>
              {index < steps.length - 1 && (
                <div className={`w-12 h-1 ${currentStep > index ? 'bg-green-500' : 'bg-black/10'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="card rounded-3xl p-8 mb-8">
        {currentStep === 0 && (
          <div className="space-y-6 animate-reveal">
            <LinkedInImport onImportComplete={handleLinkedInImport} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium opacity-60">Full Name</label>
                <input
                  type="text"
                  className="input rounded-xl"
                  placeholder="John Doe"
                  value={formData.personal.name}
                  onChange={(e) => setFormData({ ...formData, personal: { ...formData.personal, name: e.target.value } })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium opacity-60">Email Address</label>
                <input
                  type="email"
                  className="input rounded-xl"
                  placeholder="john@example.com"
                  value={formData.personal.email}
                  onChange={(e) => setFormData({ ...formData, personal: { ...formData.personal, email: e.target.value } })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium opacity-60">Phone Number</label>
                <input
                  type="tel"
                  className="input rounded-xl"
                  placeholder="+1 (555) 000-0000"
                  value={formData.personal.phone}
                  onChange={(e) => setFormData({ ...formData, personal: { ...formData.personal, phone: e.target.value } })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium opacity-60">Location</label>
                <input
                  type="text"
                  className="input rounded-xl"
                  placeholder="New York, NY"
                  value={formData.personal.location}
                  onChange={(e) => setFormData({ ...formData, personal: { ...formData.personal, location: e.target.value } })}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium opacity-60">Professional Summary</label>
                <textarea
                  className="input rounded-xl min-h-[120px] py-4"
                  placeholder="Experienced software engineer with a focus on..."
                  value={formData.personal.summary}
                  onChange={(e) => setFormData({ ...formData, personal: { ...formData.personal, summary: e.target.value } })}
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-8 animate-reveal">
            {formData.experience.map((exp, index) => (
              <div key={index} className="p-6 rounded-2xl bg-black/5 space-y-6 relative group">
                <button 
                  onClick={() => {
                    const newExp = formData.experience.filter((_, i) => i !== index);
                    setFormData({ ...formData, experience: newExp });
                  }}
                  className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium opacity-60">Job Title</label>
                    <input
                      type="text"
                      className="input rounded-xl"
                      value={exp.title}
                      onChange={(e) => updateExperience(index, 'title', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium opacity-60">Company</label>
                    <input
                      type="text"
                      className="input rounded-xl"
                      value={exp.company}
                      onChange={(e) => updateExperience(index, 'company', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium opacity-60">Location</label>
                    <input
                      type="text"
                      className="input rounded-xl"
                      value={exp.location}
                      onChange={(e) => updateExperience(index, 'location', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium opacity-60">Start Date</label>
                      <input
                        type="text"
                        className="input rounded-xl"
                        placeholder="MM/YYYY"
                        value={exp.startDate}
                        onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium opacity-60">End Date</label>
                      <input
                        type="text"
                        className="input rounded-xl"
                        placeholder="MM/YYYY or Present"
                        value={exp.endDate}
                        onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium opacity-60">Job Description</label>
                      <button
                        onClick={() => generateBulletPoints(index)}
                        disabled={isGenerating || !exp.description}
                        className="text-xs font-bold text-red-500 flex items-center gap-1 hover:opacity-80 transition-opacity disabled:opacity-50"
                      >
                        {generatingIndex === index ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                        AI POLISH
                      </button>
                    </div>
                    <textarea
                      className="input rounded-xl min-h-[100px] py-4"
                      placeholder="Describe your responsibilities and achievements..."
                      value={exp.description}
                      onChange={(e) => updateExperience(index, 'description', e.target.value)}
                    />
                  </div>
                  {exp.generatedBullets && (
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium text-red-500 font-bold flex items-center gap-2">
                        <Sparkles className="w-4 h-4" /> AI Generated Bullet Points
                      </label>
                      <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 text-sm whitespace-pre-wrap">
                        {exp.generatedBullets}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <button
              onClick={addExperience}
              className="w-full p-4 border-2 border-dashed border-black/10 rounded-2xl flex items-center justify-center gap-2 opacity-50 hover:opacity-100 hover:border-red-500/50 transition-all"
            >
              <Plus className="w-5 h-5" />
              Add Experience
            </button>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-8 animate-reveal">
            {formData.education.map((edu, index) => (
              <div key={index} className="p-6 rounded-2xl bg-black/5 space-y-6 relative group">
                <button 
                  onClick={() => {
                    const newEdu = formData.education.filter((_, i) => i !== index);
                    setFormData({ ...formData, education: newEdu });
                  }}
                  className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium opacity-60">Institution</label>
                    <input
                      type="text"
                      className="input rounded-xl"
                      value={edu.institution}
                      onChange={(e) => {
                        const newEdu = [...formData.education];
                        newEdu[index].institution = e.target.value;
                        setFormData({ ...formData, education: newEdu });
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium opacity-60">Degree</label>
                    <input
                      type="text"
                      className="input rounded-xl"
                      value={edu.degree}
                      onChange={(e) => {
                        const newEdu = [...formData.education];
                        newEdu[index].degree = e.target.value;
                        setFormData({ ...formData, education: newEdu });
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium opacity-60">Field of Study</label>
                    <input
                      type="text"
                      className="input rounded-xl"
                      value={edu.field}
                      onChange={(e) => {
                        const newEdu = [...formData.education];
                        newEdu[index].field = e.target.value;
                        setFormData({ ...formData, education: newEdu });
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium opacity-60">Graduation Date</label>
                      <input
                        type="text"
                        className="input rounded-xl"
                        placeholder="MM/YYYY"
                        value={edu.graduationDate}
                        onChange={(e) => {
                          const newEdu = [...formData.education];
                          newEdu[index].graduationDate = e.target.value;
                          setFormData({ ...formData, education: newEdu });
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium opacity-60">GPA (Optional)</label>
                      <input
                        type="text"
                        className="input rounded-xl"
                        placeholder="3.8/4.0"
                        value={edu.gpa}
                        onChange={(e) => {
                          const newEdu = [...formData.education];
                          newEdu[index].gpa = e.target.value;
                          setFormData({ ...formData, education: newEdu });
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={addEducation}
              className="w-full p-4 border-2 border-dashed border-black/10 rounded-2xl flex items-center justify-center gap-2 opacity-50 hover:opacity-100 hover:border-red-500/50 transition-all"
            >
              <Plus className="w-5 h-5" />
              Add Education
            </button>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-8 animate-reveal">
            <div className="space-y-4">
              <label className="text-sm font-medium opacity-60">Add Skills (Press Enter)</label>
              <input
                type="text"
                className="input rounded-xl"
                placeholder="e.g. React, TypeScript, Project Management..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const value = (e.target as HTMLInputElement).value.trim();
                    if (value && !formData.skills.includes(value)) {
                      setFormData({ ...formData, skills: [...formData.skills, value] });
                      (e.target as HTMLInputElement).value = '';
                    }
                  }
                }}
              />
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill, index) => (
                  <span key={index} className="px-4 py-2 bg-red-500/10 text-red-500 rounded-full text-sm font-medium flex items-center gap-2">
                    {skill}
                    <button 
                      onClick={() => setFormData({ ...formData, skills: formData.skills.filter((_, i) => i !== index) })}
                      className="hover:text-red-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div id="resume-preview" className="bg-white text-black p-12 rounded-xl shadow-2xl min-h-[800px] font-serif animate-reveal">
            <div className="text-center border-b-2 border-black pb-6 mb-8">
              <h1 className="text-4xl font-bold uppercase tracking-widest mb-2">{formData.personal.name || 'Your Name'}</h1>
              <div className="flex justify-center gap-4 text-sm">
                <span>{formData.personal.email}</span>
                <span>•</span>
                <span>{formData.personal.phone}</span>
                <span>•</span>
                <span>{formData.personal.location}</span>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-lg font-bold uppercase tracking-wider border-b border-black mb-3">Professional Summary</h2>
              <p className="text-sm leading-relaxed">{formData.personal.summary}</p>
            </div>

            <div className="mb-8">
              <h2 className="text-lg font-bold uppercase tracking-wider border-b border-black mb-4">Experience</h2>
              <div className="space-y-6">
                {formData.experience.map((exp, i) => (
                  <div key={i}>
                    <div className="flex justify-between font-bold">
                      <span>{exp.title}</span>
                      <span>{exp.startDate} - {exp.endDate}</span>
                    </div>
                    <div className="flex justify-between italic mb-2">
                      <span>{exp.company}</span>
                      <span>{exp.location}</span>
                    </div>
                    <div className="text-sm whitespace-pre-wrap list-disc pl-5">
                      {exp.generatedBullets ? exp.generatedBullets.split('\n').map((bullet, bi) => (
                        <div key={bi} className="mb-1">• {bullet.replace(/^[•\-\*]\s*/, '')}</div>
                      )) : exp.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-lg font-bold uppercase tracking-wider border-b border-black mb-4">Education</h2>
              <div className="space-y-4">
                {formData.education.map((edu, i) => (
                  <div key={i} className="flex justify-between">
                    <div>
                      <div className="font-bold">{edu.institution}</div>
                      <div className="text-sm">{edu.degree} in {edu.field}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{edu.graduationDate}</div>
                      {edu.gpa && <div className="text-sm">GPA: {edu.gpa}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold uppercase tracking-wider border-b border-black mb-3">Skills</h2>
              <div className="text-sm">
                {formData.skills.join(' • ')}
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-between mt-8">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="btn btn-secondary rounded-xl flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          {currentStep < steps.length - 1 && (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={
                (currentStep === 0 && (!formData.personal.name || !formData.personal.email || !formData.personal.phone || !formData.personal.location || !formData.personal.summary)) ||
                (currentStep === 1 && (formData.experience.length === 0 || formData.experience.some(exp => !exp.title || !exp.company || !exp.startDate || !exp.description))) ||
                (currentStep === 2 && (formData.education.length === 0 || formData.education.some(edu => !edu.institution || !edu.degree || !edu.graduationDate))) ||
                (currentStep === 3 && formData.skills.length === 0)
              }
              className="btn btn-primary rounded-xl flex items-center gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      {currentStep === steps.length - 1 && (
        <div className="flex justify-center gap-4">
          <button
            onClick={copyToClipboard}
            className="btn btn-secondary rounded-xl flex items-center gap-2"
          >
            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            {copied ? 'Copied!' : 'Copy Text'}
          </button>
          <button
            onClick={exportToPDF}
            disabled={isExporting}
            className="btn btn-primary rounded-xl flex items-center gap-2"
          >
            {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileDown className="w-5 h-5" />}
            {isExporting ? 'Exporting...' : 'Export PDF'}
          </button>
        </div>
      )}
    </div>
  );
}
