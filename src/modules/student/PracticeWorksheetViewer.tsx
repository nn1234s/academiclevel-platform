import React, { useState, useEffect } from 'react';
import { Learner, Board, Grade, Question, LevelNode } from '../../core/types';
import { CurriculumService } from '../../services/curriculumService';
import { OfflineBankService } from '../../services/offlineBankService';
import {
  Printer,
  Download,
  RefreshCw,
  X,
  FileText,
  CheckCircle,
  HelpCircle,
  Scissors,
  BookOpen,
  Sparkles,
  GraduationCap
} from 'lucide-react';

interface PracticeWorksheetViewerProps {
  learner: Learner;
  onClose: () => void;
}

export const PracticeWorksheetViewer: React.FC<PracticeWorksheetViewerProps> = ({
  learner,
  onClose
}) => {
  const [board, setBoard] = useState<Board>(learner.board || 'CBSE');
  const [grade, setGrade] = useState<Grade>(learner.grade || 10);
  const subjects = CurriculumService.getSubjects(board, grade);
  const [subjectId, setSubjectId] = useState<string>(subjects[0]?.id || 'math');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [levelNode, setLevelNode] = useState<LevelNode>('FOUNDATION');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'worksheet' | 'solutions'>('worksheet');

  // Keep subject valid when grade or board changes
  useEffect(() => {
    const currentSubjects = CurriculumService.getSubjects(board, grade);
    if (!currentSubjects.some(s => s.id === subjectId)) {
      setSubjectId(currentSubjects[0]?.id || 'math');
    }
  }, [board, grade]);

  // Fetch questions from question bank
  const loadQuestions = async () => {
    setIsLoading(true);
    try {
      const qList = await OfflineBankService.fetchServerQuestions(
        board,
        grade,
        subjectId,
        levelNode,
        questionCount
      );
      setQuestions(qList.slice(0, questionCount));
    } catch {
      setQuestions(OfflineBankService.getQuestions(board, grade, subjectId, levelNode).slice(0, questionCount));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [board, grade, subjectId, questionCount, levelNode]);

  const activeSubjectObj = subjects.find(s => s.id === subjectId) || subjects[0];
  const currentDateStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  // Native Vector PDF Printable Window Generator
  const handlePrintWorksheet = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to open the printable worksheet.');
      return;
    }

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>AcademicLevel_Worksheet_${board}_Class${grade}_${subjectId.toUpperCase()}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 14mm 16mm;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #111827;
      background: #ffffff;
      line-height: 1.45;
      font-size: 11pt;
      margin: 0;
      padding: 0;
    }
    .header-box {
      border: 2px solid #1e293b;
      padding: 12px 16px;
      margin-bottom: 16px;
      border-radius: 6px;
    }
    .header-title-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1.5px solid #0f172a;
      padding-bottom: 8px;
      margin-bottom: 8px;
    }
    .institute-title {
      font-size: 16pt;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: 0.5px;
    }
    .doc-badge {
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      padding: 3px 8px;
      font-size: 8.5pt;
      font-weight: 700;
      text-transform: uppercase;
      border-radius: 4px;
    }
    .meta-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9.5pt;
    }
    .meta-table td {
      padding: 3px 6px;
    }
    .meta-label {
      font-weight: 700;
      color: #475569;
      width: 15%;
    }
    .meta-value {
      font-weight: 600;
      color: #0f172a;
      width: 35%;
      border-bottom: 1px dotted #94a3b8;
    }
    .instructions-box {
      background: #f8fafc;
      border: 1px dashed #94a3b8;
      padding: 8px 12px;
      margin-bottom: 18px;
      font-size: 8.5pt;
      color: #334155;
      border-radius: 4px;
    }
    .instructions-title {
      font-weight: 700;
      text-transform: uppercase;
      margin-bottom: 4px;
      color: #0f172a;
    }
    .instructions-list {
      margin: 0;
      padding-left: 18px;
    }
    .instructions-list li {
      margin-bottom: 2px;
    }
    .section-title {
      font-size: 11pt;
      font-weight: 800;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 4px;
      margin: 16px 0 12px 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .question-item {
      margin-bottom: 14px;
      page-break-inside: avoid;
    }
    .question-head {
      display: flex;
      justify-content: space-between;
      font-weight: 700;
      margin-bottom: 4px;
    }
    .question-text {
      font-weight: 600;
      font-size: 10.5pt;
      color: #0f172a;
      margin-bottom: 6px;
    }
    .options-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px 16px;
      margin-left: 12px;
      margin-bottom: 6px;
    }
    .option-row {
      display: flex;
      align-items: center;
      font-size: 9.5pt;
    }
    .bubble {
      display: inline-block;
      width: 15px;
      height: 15px;
      border: 1.5px solid #334155;
      border-radius: 50%;
      margin-right: 8px;
      flex-shrink: 0;
    }
    .option-letter {
      font-weight: 700;
      margin-right: 6px;
      color: #334155;
    }
    .answer-box-line {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      margin-top: 3px;
      font-size: 8.5pt;
      color: #64748b;
    }
    .ans-box {
      border: 1px solid #0f172a;
      width: 48px;
      height: 18px;
      margin-left: 8px;
      text-align: center;
      font-weight: bold;
    }
    .rough-work-box {
      border: 1.5px dashed #94a3b8;
      border-radius: 4px;
      height: 140px;
      margin-top: 14px;
      padding: 8px;
      position: relative;
      page-break-inside: avoid;
    }
    .rough-work-label {
      position: absolute;
      top: 6px;
      left: 8px;
      font-size: 8pt;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .page-break {
      page-break-before: always;
      break-before: page;
    }
    .cut-line {
      border-top: 2px dashed #94a3b8;
      margin: 20px 0;
      position: relative;
      text-align: center;
    }
    .cut-text {
      position: absolute;
      top: -10px;
      left: 50%;
      transform: translateX(-50%);
      background: #ffffff;
      padding: 0 10px;
      font-size: 8pt;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
    }
    .answer-key-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
      font-size: 9.5pt;
    }
    .answer-key-table th, .answer-key-table td {
      border: 1px solid #cbd5e1;
      padding: 6px;
      text-align: center;
    }
    .answer-key-table th {
      background: #f1f5f9;
      font-weight: 700;
    }
    .solution-item {
      margin-bottom: 10px;
      padding-bottom: 8px;
      border-bottom: 1px dotted #e2e8f0;
      font-size: 9.5pt;
      page-break-inside: avoid;
    }
    .sol-header {
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 2px;
    }
    .sol-text {
      color: #334155;
    }
    @media print {
      body {
        margin: 0;
        padding: 0;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <!-- ASSESSMENT HEADER -->
  <div class="header-box">
    <div class="header-title-row">
      <div class="institute-title">ACADEMICLEVEL HIGH-YIELD PRACTICE WORKSHEET</div>
      <div class="doc-badge">Curriculum Calibrated</div>
    </div>
    <table class="meta-table">
      <tr>
        <td class="meta-label">Candidate:</td>
        <td class="meta-value">${learner.fullName || 'Student'}</td>
        <td class="meta-label">Class & Board:</td>
        <td class="meta-value">Class ${grade} • ${board}</td>
      </tr>
      <tr>
        <td class="meta-label">Subject:</td>
        <td class="meta-value">${activeSubjectObj?.name || subjectId.toUpperCase()}</td>
        <td class="meta-label">Date Issued:</td>
        <td class="meta-value">${currentDateStr}</td>
      </tr>
      <tr>
        <td class="meta-label">Student ID:</td>
        <td class="meta-value">AL-${learner.id.substring(0, 8).toUpperCase()}</td>
        <td class="meta-label">Marks & Time:</td>
        <td class="meta-value">Max Marks: ${questions.length} | Time: ${questions.length * 2} Mins</td>
      </tr>
    </table>
  </div>

  <!-- INSTRUCTIONS -->
  <div class="instructions-box">
    <div class="instructions-title">General Instructions to Candidate:</div>
    <ul class="instructions-list">
      <li>This assessment worksheet contains <strong>${questions.length}</strong> Multiple Choice Questions calibrated strictly to the official <strong>${board} Class ${grade}</strong> syllabus.</li>
      <li>Each question carries <strong>1 mark</strong>. Darken the circular bubble corresponding to your selected option or record your choice in the box provided.</li>
      <li>Use the designated rough work workspace for rough calculations, arithmetic, and formula proofs.</li>
      <li>After completion, refer to the detachable step-by-step NCERT / Board solutions on the reverse page for self-evaluation.</li>
    </ul>
  </div>

  <!-- SECTION A: QUESTIONS -->
  <div class="section-title">SECTION A: OBJECTIVE CURRICULUM QUESTIONS (${questions.length} MARKS)</div>
  <div class="questions-container">
    ${questions.map((q, idx) => `
      <div class="question-item">
        <div class="question-head">
          <span>Q${idx + 1}.</span>
          <span style="font-size: 8pt; color: #64748b; font-weight: 500;">[Topic: ${q.topicTag || 'Core Syllabus'}] • [1 Mark]</span>
        </div>
        <div class="question-text">${q.text}</div>
        <div class="options-grid">
          ${q.options.map((opt, oIdx) => `
            <div class="option-row">
              <span class="bubble"></span>
              <span class="option-letter">(${String.fromCharCode(65 + oIdx)})</span>
              <span>${opt}</span>
            </div>
          `).join('')}
        </div>
        <div class="answer-box-line">
          <span>Candidate Choice:</span>
          <div class="ans-box"></div>
        </div>
      </div>
    `).join('')}
  </div>

  <!-- SECTION B: ROUGH WORK -->
  <div class="rough-work-box">
    <div class="rough-work-label">Student Rough Work & Calculation Scratchpad</div>
  </div>

  <!-- SECTION C: DETACHABLE SOLUTIONS (PAGE BREAK) -->
  <div class="page-break"></div>
  <div class="cut-line">
    <span class="cut-text">✂️ Detachable Answer Key & NCERT Step-by-Step Solutions (Teacher / Parent Review) ✂️</span>
  </div>

  <div class="header-box" style="margin-top: 10px;">
    <div class="header-title-row">
      <div class="institute-title" style="font-size: 14pt;">SOLUTIONS & SCORING RUBRIC</div>
      <div class="doc-badge">${board} Class ${grade} • ${activeSubjectObj?.name || subjectId.toUpperCase()}</div>
    </div>
    <p style="margin: 0; font-size: 9pt; color: #475569;">
      Candidate: <strong>${learner.fullName || 'Student'}</strong> • Total Questions: <strong>${questions.length}</strong> • Max Score: <strong>${questions.length} / ${questions.length}</strong>
    </p>
  </div>

  <!-- QUICK ANSWER GRID -->
  <div class="section-title" style="font-size: 10pt; margin-top: 10px;">Quick Answer Matrix</div>
  <table class="answer-key-table">
    <tr>
      ${questions.map((_, idx) => `<th>Q${idx + 1}</th>`).join('')}
    </tr>
    <tr>
      ${questions.map((q) => `<td><strong>(${String.fromCharCode(65 + q.correctIndex)})</strong></td>`).join('')}
    </tr>
  </table>

  <!-- DETAILED STEP-BY-STEP EXPLANATIONS -->
  <div class="section-title" style="font-size: 10pt;">Detailed Socratic & NCERT Explanations</div>
  <div class="solutions-container">
    ${questions.map((q, idx) => `
      <div class="solution-item">
        <div class="sol-header">
          Q${idx + 1}. Correct Answer: (${String.fromCharCode(65 + q.correctIndex)}) ${q.options[q.correctIndex]}
        </div>
        <div class="sol-text">
          <strong>Proof & Explanation:</strong> ${q.explanation || 'Verified curriculum standard solution.'}
          ${q.hint ? `<br><span style="font-size: 8.5pt; color: #64748b;"><em>Pedagogical Clue: ${q.hint}</em></span>` : ''}
        </div>
      </div>
    `).join('')}
  </div>

  <div style="text-align: center; margin-top: 20px; font-size: 8.5pt; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 8px;">
    AcademicLevel Platform • High-Yield Question Bank • Verified Curriculum Standard
  </div>

  <script>
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Offline HTML File Download Generator
  const handleDownloadOfflineWorksheet = () => {
    const filename = `AcademicLevel_${board}_Class${grade}_${subjectId}_Worksheet.html`;
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>AcademicLevel Practice Worksheet - Class ${grade} ${board}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 20px auto; padding: 20px; color: #1e293b; }
    h1 { color: #312e81; border-bottom: 2px solid #4338ca; padding-bottom: 8px; font-size: 20px; }
    .meta { background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 8px; margin-bottom: 20px; }
    .question { margin-bottom: 16px; padding: 12px; border-bottom: 1px solid #cbd5e1; }
    .options { margin-left: 20px; }
    .solutions { margin-top: 40px; border-top: 3px dashed #64748b; padding-top: 20px; }
    .badge { background: #e0e7ff; color: #3730a3; padding: 2px 6px; border-radius: 4px; font-size: 11px; }
  </style>
</head>
<body>
  <h1>ACADEMICLEVEL PRACTICE WORKSHEET</h1>
  <div class="meta">
    <p><strong>Candidate:</strong> ${learner.fullName || 'Student'} | <strong>Board & Class:</strong> ${board} Class ${grade}</p>
    <p><strong>Subject:</strong> ${activeSubjectObj?.name || subjectId} | <strong>Total Questions:</strong> ${questions.length}</p>
  </div>
  <h2>Section A: Assessment Questions</h2>
  ${questions.map((q, i) => `
    <div class="question">
      <p><strong>Q${i + 1}.</strong> ${q.text} <span class="badge">${q.difficulty}</span></p>
      <div class="options">
        ${q.options.map((opt, o) => `<p>(${String.fromCharCode(65 + o)}) ${opt}</p>`).join('')}
      </div>
    </div>
  `).join('')}
  <div class="solutions">
    <h2>Section B: Detachable Answer Key & Explanations</h2>
    ${questions.map((q, i) => `
      <div class="question">
        <p><strong>Q${i + 1}. Correct Answer: (${String.fromCharCode(65 + q.correctIndex)})</strong> ${q.options[q.correctIndex]}</p>
        <p><em>Solution:</em> ${q.explanation}</p>
      </div>
    `).join('')}
  </div>
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border border-indigo-900/60 rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* TOP MODAL HEADER */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border-b border-indigo-900/50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-white text-base">Class Practice Worksheets & PDF Center</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 border border-amber-500/30 text-amber-300">
                  30 Coins Unlocked
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Calibrated 12,000-question curriculum bank for Classes 1 to 12 with rough work & solutions
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* CONTROLS & GENERATOR TOOLBAR */}
        <div className="p-4 bg-slate-950/90 border-b border-slate-800 grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
          {/* Board Selector */}
          <div>
            <label className="block text-[10px] text-slate-400 mb-1 font-semibold">Board</label>
            <select
              value={board}
              onChange={e => setBoard(e.target.value as Board)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white"
            >
              <option value="CBSE">CBSE Board</option>
              <option value="ICSE">ICSE Board</option>
              <option value="IGCSE">Cambridge IGCSE</option>
            </select>
          </div>

          {/* Grade Selector (All Classes 1 to 12) */}
          <div>
            <label className="block text-[10px] text-slate-400 mb-1 font-semibold">Class / Grade</label>
            <select
              value={grade}
              onChange={e => setGrade(Number(e.target.value) as Grade)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(g => (
                <option key={g} value={g}>Class {g}</option>
              ))}
            </select>
          </div>

          {/* Subject Selector */}
          <div>
            <label className="block text-[10px] text-slate-400 mb-1 font-semibold">Subject</label>
            <select
              value={subjectId}
              onChange={e => setSubjectId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Question Count */}
          <div>
            <label className="block text-[10px] text-slate-400 mb-1 font-semibold">Length</label>
            <select
              value={questionCount}
              onChange={e => setQuestionCount(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white"
            >
              <option value={10}>10 Questions (Quick)</option>
              <option value={15}>15 Questions (Standard)</option>
              <option value={20}>20 Questions (Mock)</option>
            </select>
          </div>

          {/* Re-roll Generator */}
          <div className="flex items-end col-span-2 sm:col-span-1">
            <button
              onClick={loadQuestions}
              disabled={isLoading}
              className="w-full py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all flex items-center justify-center space-x-1.5 shadow-md"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Fetching...' : 'Re-roll Bank'}</span>
            </button>
          </div>
        </div>

        {/* VIEW TABS & EXPORT ACTIONS BAR */}
        <div className="px-4 py-2.5 bg-slate-900/60 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
          {/* Tab Switcher */}
          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('worksheet')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'worksheet'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              📄 Student Worksheet
            </button>
            <button
              onClick={() => setActiveTab('solutions')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'solutions'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ✂️ Solutions & Key
            </button>
          </div>

          {/* Action Buttons: 1-Click Print PDF & Offline Download */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrintWorksheet}
              className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              onClick={handleDownloadOfflineWorksheet}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download (.html)</span>
            </button>
          </div>
        </div>

        {/* WORKSHEET PREVIEW CONTENT */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {isLoading ? (
            <div className="py-20 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
              <p className="text-xs text-slate-400">
                Curating high-yield questions for {board} Class {grade} {activeSubjectObj?.name}...
              </p>
            </div>
          ) : activeTab === 'worksheet' ? (
            /* ========================================================== */
            /* TAB: WORKSHEET PREVIEW */
            /* ========================================================== */
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-7 space-y-6 shadow-inner">
              {/* Document Banner */}
              <div className="border-b border-slate-800 pb-4 space-y-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <h2 className="text-lg font-black text-white tracking-wide">
                      ACADEMICLEVEL HIGH-YIELD PRACTICE WORKSHEET
                    </h2>
                    <p className="text-xs text-indigo-400 font-semibold mt-0.5">
                      {board} • Class {grade} • {activeSubjectObj?.name || subjectId.toUpperCase()}
                    </p>
                  </div>
                  <div className="px-3 py-1 bg-indigo-950/60 border border-indigo-800 text-indigo-300 rounded-full text-xs font-mono font-bold">
                    Max Marks: {questions.length} | Time: {questions.length * 2} Mins
                  </div>
                </div>

                {/* Candidate Info Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800/80 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Student Name:</span>
                    <span className="font-bold text-white">{learner.fullName || 'Student'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Student ID:</span>
                    <span className="font-mono text-slate-300">AL-{learner.id.substring(0, 8).toUpperCase()}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Class & Board:</span>
                    <span className="font-semibold text-slate-300">Class {grade} ({board})</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Date Issued:</span>
                    <span className="font-semibold text-slate-300">{currentDateStr}</span>
                  </div>
                </div>
              </div>

              {/* Section A: Question Items */}
              <div className="space-y-5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300 border-b border-slate-800 pb-2">
                  <span>SECTION A: MULTIPLE CHOICE ASSESSMENT</span>
                  <span className="text-slate-500 font-mono text-[10px]">{questions.length} Questions</span>
                </div>

                {questions.map((q, idx) => (
                  <div
                    key={q.id || idx}
                    className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start space-x-2">
                        <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-300 font-bold text-xs flex items-center justify-center flex-shrink-0">
                          {idx + 1}
                        </span>
                        <p className="text-xs font-semibold text-white leading-relaxed">
                          {q.text}
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-slate-400 flex-shrink-0">
                        {q.difficulty}
                      </span>
                    </div>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-8">
                      {q.options.map((opt, oIdx) => (
                        <div
                          key={oIdx}
                          className="flex items-center space-x-2 p-2 rounded-xl bg-slate-950 border border-slate-800/60 text-xs text-slate-300"
                        >
                          <span className="w-5 h-5 rounded-full border border-slate-600 flex items-center justify-center text-[10px] font-bold text-slate-400">
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <span>{opt}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center text-[11px] text-slate-500 pl-8 pt-1">
                      <span>Topic: {q.topicTag || 'Core Curriculum'}</span>
                      <span className="font-mono">Candidate Answer: [ ____ ]</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Section B: Rough Work Area */}
              <div className="border border-dashed border-slate-700 rounded-2xl p-4 bg-slate-900/30 text-center space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Student Rough Work & Calculation Area
                </span>
                <p className="text-[10px] text-slate-500">
                  (Use this space on the printed worksheet for step calculations, scratch notes, and formulas)
                </p>
                <div className="h-16"></div>
              </div>
            </div>
          ) : (
            /* ========================================================== */
            /* TAB: SOLUTIONS & DETACHABLE ANSWER KEY */
            /* ========================================================== */
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-7 space-y-6 shadow-inner">
              <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center space-x-2">
                    <Scissors className="w-4 h-4 text-emerald-400" />
                    <span>Detachable Answer Key & NCERT Step-by-Step Solutions</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Parent & Teacher Grading Rubric • {board} Class {grade} {activeSubjectObj?.name}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-950/60 border border-emerald-800 text-emerald-300">
                  Answer Key
                </span>
              </div>

              {/* Quick Answer Key Matrix */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Quick Reference Matrix:</span>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                  {questions.map((q, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-1"
                    >
                      <span className="text-[10px] text-slate-500 font-mono block">Q{idx + 1}</span>
                      <span className="text-xs font-extrabold text-emerald-400">
                        ({String.fromCharCode(65 + q.correctIndex)})
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detailed Socratic Explanations */}
              <div className="space-y-4 pt-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Detailed Solutions & Explanations:</span>
                {questions.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between font-bold text-white">
                      <span>Q{idx + 1}. Correct Option: ({String.fromCharCode(65 + q.correctIndex)}) {q.options[q.correctIndex]}</span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800">
                        1 Mark
                      </span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      <strong>Solution:</strong> {q.explanation || 'Verified curriculum standard solution.'}
                    </p>
                    {q.hint && (
                      <p className="text-slate-400 italic text-[11px]">
                        💡 <strong>Hint / Pedagogical Note:</strong> {q.hint}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM MODAL FOOTER */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 text-slate-400">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>
              Dynamic practice worksheet generated from 12,000-question SQLite bank for <strong>Class {grade} {board}</strong>
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrintWorksheet}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md transition-all flex items-center space-x-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Print Worksheet</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-all"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};