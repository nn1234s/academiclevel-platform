import { Board, Grade, Subject, CourseLevel, LevelNode } from '../core/types';

export class CurriculumService {
  private static SUBJECT_CATALOG: Subject[] = [
    {
      id: 'math',
      name: 'Mathematics',
      icon: '📐',
      color: 'from-blue-600 to-indigo-600',
      description: 'Arithmetic, Algebra, Geometry, Trigonometry, Calculus & Mathematical Reasoning.',
      grades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      boards: ['CBSE', 'ICSE', 'IGCSE']
    },
    {
      id: 'science',
      name: 'Science & Discovery',
      icon: '🔬',
      color: 'from-emerald-600 to-teal-600',
      description: 'Environmental Science, Natural World, Matter, Living Organisms & Energy.',
      grades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      boards: ['CBSE', 'ICSE', 'IGCSE']
    },
    {
      id: 'physics',
      name: 'Physics',
      icon: '⚡',
      color: 'from-violet-600 to-purple-600',
      description: 'Mechanics, Electromagnetism, Optics, Modern Physics & Wave Phenomena.',
      grades: [11, 12],
      boards: ['CBSE', 'ICSE', 'IGCSE']
    },
    {
      id: 'chemistry',
      name: 'Chemistry',
      icon: '🧪',
      color: 'from-rose-600 to-pink-600',
      description: 'Physical, Organic, Inorganic Chemistry, Chemical Bonding & Thermodynamics.',
      grades: [11, 12],
      boards: ['CBSE', 'ICSE', 'IGCSE']
    },
    {
      id: 'biology',
      name: 'Biology',
      icon: '🧬',
      color: 'from-emerald-500 to-green-600',
      description: 'Genetics, Cell Physiology, Ecology, Human Physiology & Biotechnology.',
      grades: [11, 12],
      boards: ['CBSE', 'ICSE', 'IGCSE']
    },
    {
      id: 'social',
      name: 'Social Sciences',
      icon: '🌍',
      color: 'from-amber-600 to-orange-600',
      description: 'History, Civics, Geography, Economics & Global Human Societies.',
      grades: [5, 6, 7, 8, 9, 10],
      boards: ['CBSE', 'ICSE', 'IGCSE']
    },
    {
      id: 'english',
      name: 'English Language & Reading',
      icon: '📚',
      color: 'from-sky-600 to-cyan-600',
      description: 'Grammar mechanics, vocabulary enrichment, critical comprehension & composition.',
      grades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      boards: ['CBSE', 'ICSE', 'IGCSE']
    },
    {
      id: 'commerce',
      name: 'Accountancy & Business',
      icon: '📊',
      color: 'from-cyan-600 to-blue-700',
      description: 'Financial Statements, Partnership Accounting, Business Management & Finance.',
      grades: [11, 12],
      boards: ['CBSE', 'ICSE']
    },
    {
      id: 'cs',
      name: 'Computer Science & AI',
      icon: '💻',
      color: 'from-indigo-600 to-slate-800',
      description: 'Algorithmic logic, Python programming, Data structures & AI fundamentals.',
      grades: [6, 7, 8, 9, 10, 11, 12],
      boards: ['CBSE', 'ICSE', 'IGCSE']
    }
  ];

  /**
   * Retrieves subjects eligible for the active student's board and grade.
   */
  public static getSubjects(board: Board, grade: Grade): Subject[] {
    return this.SUBJECT_CATALOG.filter(
      s => s.grades.includes(grade) && s.boards.includes(board)
    );
  }

  /**
   * Generates the 4-tier Progression Nodes for a given Subject x Grade x Board.
   */
  public static getLevels(board: Board, grade: Grade, subjectId: string): CourseLevel[] {
    const subject = this.SUBJECT_CATALOG.find(s => s.id === subjectId);
    const subjectTitle = subject ? subject.name : 'Core';

    const nodeMetadata: Record<
      LevelNode,
      { title: string; desc: string; count: number; mins: number; topics: string[] }
    > = {
      FOUNDATION: {
        title: `${subjectTitle} — Foundation & Visual Intuition`,
        desc: `Master core definitions, key formulas, and foundational intuition aligned with the ${board} syllabus.`,
        count: 10,
        mins: 15,
        topics: [
          `Fundamental Core Concepts (${board} Class ${grade})`,
          'Formula Recall & Key Terminology',
          'Step-by-Step Guided Illustrations'
        ]
      },
      CONCEPT: {
        title: `${subjectTitle} — Concept Deep Dive & Applications`,
        desc: `Bridge textbook theory to real-world scenarios and multi-step analytical problems.`,
        count: 12,
        mins: 20,
        topics: [
          'Analytical Case Scenarios',
          'Multi-Step Numerical Problems',
          'Conceptual Misconception Fixes'
        ]
      },
      EXAM_READY: {
        title: `${subjectTitle} — ${board} Exam-Ready & PYQs`,
        desc: `Board exam simulations, previous year question trends, and high-weightage question mastery.`,
        count: 15,
        mins: 25,
        topics: [
          `${board} Past Year Exam Trends`,
          'High-Yield Marking Scheme Focus',
          'Assertion-Reason & Case-Based Sets'
        ]
      },
      OLYMPIAD: {
        title: `${subjectTitle} — Olympiad & Advanced Thinking`,
        desc: `Rigorous higher-order thinking (HOTS) questions for competitive Olympiads and entrance foundations.`,
        count: 15,
        mins: 30,
        topics: [
          'National & International Olympiad Logic',
          'Higher-Order Thinking Skills (HOTS)',
          'Non-Routine Competitive Reasoning'
        ]
      }
    };

    const nodes: LevelNode[] = ['FOUNDATION', 'CONCEPT', 'EXAM_READY', 'OLYMPIAD'];

    return nodes.map(node => {
      const meta = nodeMetadata[node];
      return {
        id: `${board.toLowerCase()}_g${grade}_${subjectId}_${node.toLowerCase()}`,
        subjectId,
        board,
        grade,
        node,
        title: meta.title,
        description: meta.desc,
        questionCount: meta.count,
        estimatedMinutes: meta.mins,
        topics: meta.topics
      };
    });
  }
}
