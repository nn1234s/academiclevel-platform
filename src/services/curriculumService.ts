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

  /**
   * Retrieves organized, real syllabus chapters for a given Subject x Grade x Board.
   * Ensures questions are categorized by chapter (Addition, Subtraction, Multiplication, Algebra, etc.).
   */
  public static getChaptersForSubject(board: Board, grade: Grade, subjectId: string): {
    id: string;
    title: string;
    description: string;
    questionCount: number;
    estimatedMinutes: number;
    topics: string[];
    badge: string;
  }[] {
    const sId = (subjectId || '').toLowerCase();

    // 1. MATHEMATICS CHAPTERS
    if (sId.includes('math')) {
      if (grade <= 2) {
        return [
          {
            id: 'ch_math_add',
            title: 'Addition & Word Problems',
            description: 'Single and 2-digit addition, visual counting models, and daily real-world word problems.',
            questionCount: 10,
            estimatedMinutes: 12,
            topics: ['Single-Digit Addition', '2-Digit Addition without Carry', 'Real-Life Story Problems'],
            badge: 'Essential Foundation'
          },
          {
            id: 'ch_math_sub',
            title: 'Subtraction & Number Differences',
            description: 'Taking away, difference comparison, and backwards number line counting.',
            questionCount: 10,
            estimatedMinutes: 12,
            topics: ['Basic Subtraction', '2-Digit Subtraction', 'Missing Addends'],
            badge: 'Core Skill'
          },
          {
            id: 'ch_math_num',
            title: 'Number Sequences & Place Value',
            description: 'Hundreds, Tens, Ones, Before/After/Between sequences, and greater/smaller comparisons.',
            questionCount: 10,
            estimatedMinutes: 12,
            topics: ['Place Value Models', 'Ascending & Descending Order', 'Skip Counting by 2s and 5s'],
            badge: 'Number Sense'
          },
          {
            id: 'ch_math_geo',
            title: '2D Shapes & Spatial Geometry',
            description: 'Circles, Triangles, Rectangles, Squares, edges, vertices, and spatial reasoning.',
            questionCount: 10,
            estimatedMinutes: 10,
            topics: ['Flat Shapes Identification', 'Sides and Corners', 'Patterns and Symmetry'],
            badge: 'Visual Math'
          }
        ];
      }
      if (grade <= 5) {
        return [
          {
            id: 'ch_math_ops',
            title: 'Multiplication & Division Operations',
            description: 'Multiplication tables 1-20, long division with remainders, and multi-step word problems.',
            questionCount: 10,
            estimatedMinutes: 15,
            topics: ['3-Digit Multiplication', 'Long Division Mechanics', 'Divisibility Rules'],
            badge: 'Core Arithmetic'
          },
          {
            id: 'ch_math_frac',
            title: 'Fractions & Decimals',
            description: 'Proper, improper, mixed fractions, decimal place values, and unit conversions.',
            questionCount: 10,
            estimatedMinutes: 15,
            topics: ['Like & Unlike Fractions Addition', 'Decimal Expansions', 'Fraction Visual Models'],
            badge: 'High Weightage'
          },
          {
            id: 'ch_math_factors',
            title: 'HCF, LCM & Prime Factorisation',
            description: 'Factor trees, prime numbers, greatest common divisor, and least common multiples.',
            questionCount: 10,
            estimatedMinutes: 15,
            topics: ['Prime vs Composite', 'Prime Factorisation Method', 'Real-World LCM Problems'],
            badge: 'Critical Concept'
          },
          {
            id: 'ch_math_mens',
            title: 'Perimeter, Area & Measurements',
            description: 'Perimeter of rectangles and squares, area formulas, metric conversions, and units.',
            questionCount: 10,
            estimatedMinutes: 15,
            topics: ['Perimeter Formulas', 'Area in Square Units', 'Volume of Cubes & Cuboids'],
            badge: 'Applied Geometry'
          }
        ];
      }
      if (grade <= 8) {
        return [
          {
            id: 'ch_math_alg',
            title: 'Algebraic Expressions & Identities',
            description: 'Monomials, polynomials, standard identities (a+b)², (a-b)², and factorisation.',
            questionCount: 10,
            estimatedMinutes: 15,
            topics: ['Standard Algebraic Identities', 'Combining Like Terms', 'Factorisation Techniques'],
            badge: 'Algebra Core'
          },
          {
            id: 'ch_math_lineq',
            title: 'Linear Equations in One Variable',
            description: 'Solving linear equations with variables on one or both sides and applied age/speed word problems.',
            questionCount: 10,
            estimatedMinutes: 15,
            topics: ['Transposition Method', 'Equation Word Problems', 'Cross-Multiplication'],
            badge: 'Board Fundamental'
          },
          {
            id: 'ch_math_rat',
            title: 'Rational Numbers & Exponents',
            description: 'Properties of rational numbers, closure, associativity, laws of exponents, and negative powers.',
            questionCount: 10,
            estimatedMinutes: 15,
            topics: ['Rational Operations', 'Laws of Indices & Exponents', 'Scientific Notation'],
            badge: 'Number Theory'
          },
          {
            id: 'ch_math_geom',
            title: 'Geometry & Understanding Quadrilaterals',
            description: 'Polygons, angle sum property, parallelograms, rhombuses, rectangles, and geometric proofs.',
            questionCount: 10,
            estimatedMinutes: 15,
            topics: ['Angle Sum of Polygons', 'Properties of Parallelograms', 'Geometric Constructions'],
            badge: 'Proof & Logic'
          }
        ];
      }
      // Grades 9-10
      if (grade <= 10) {
        return [
          {
            id: 'ch_math_real',
            title: 'Real Numbers & Polynomials',
            description: 'Fundamental Theorem of Arithmetic, irrationality proofs, zeroes of polynomials, and division algorithm.',
            questionCount: 10,
            estimatedMinutes: 15,
            topics: ['HCF/LCM Proofs', 'Relationship Between Zeroes & Coefficients', 'Quadratic Polynomial Graphs'],
            badge: `${board} Unit 1`
          },
          {
            id: 'ch_math_quad',
            title: 'Quadratic Equations & AP',
            description: 'Discriminant nature of roots, quadratic formula, n-th term of AP, and sum of first n terms.',
            questionCount: 10,
            estimatedMinutes: 15,
            topics: ['Discriminant D = b² - 4ac', 'Word Problems on Speed & Work', 'AP Formula Derivations'],
            badge: 'High Scoring'
          },
          {
            id: 'ch_math_trig',
            title: 'Introduction to Trigonometry',
            description: 'Trigonometric ratios (sin, cos, tan), standard angle values (0°, 30°, 45°, 60°, 90°), and trigonometric identities.',
            questionCount: 10,
            estimatedMinutes: 15,
            topics: ['Trig Ratio Definitions', 'Sin²θ + Cos²θ = 1 Identities', 'Heights and Distances'],
            badge: 'Mastery Benchmark'
          },
          {
            id: 'ch_math_coord',
            title: 'Coordinate Geometry & Triangles',
            description: 'Distance formula, section formula for internal division, similarity criteria for triangles, and area formulas.',
            questionCount: 10,
            estimatedMinutes: 15,
            topics: ['Distance & Section Formulas', 'Thales Theorem (BPT)', 'Criteria for Similar Triangles'],
            badge: 'Analytical Geometry'
          },
          {
            id: 'ch_math_circ',
            title: 'Circles & Tangents',
            description: 'Tangent properties, equal lengths of tangents from external points, and radius-tangent perpendicularity.',
            questionCount: 10,
            estimatedMinutes: 15,
            topics: ['Theorems on Tangents', 'Chords and Secants', 'Board PYQ Proofs'],
            badge: 'Geometric Theorems'
          },
          {
            id: 'ch_math_prob',
            title: 'Statistics & Probability',
            description: 'Mean, median, mode of grouped data, empirical probability, coin/dice/card outcomes, and event spaces.',
            questionCount: 10,
            estimatedMinutes: 15,
            topics: ['Step-Deviation Mean Method', 'Median & Mode of Grouped Data', 'Probability Rules'],
            badge: 'Guaranteed Marks'
          }
        ];
      }
      // Grades 11-12
      return [
        {
          id: 'ch_math_calc',
          title: 'Calculus: Limits, Derivatives & Integrals',
          description: 'Differentiation rules, chain rule, definite integrals, and application of derivatives to tangents and maxima.',
          questionCount: 12,
          estimatedMinutes: 20,
          topics: ['Limits and Continuity', 'Chain Rule & Product Rule', 'Definite Integrals Properties'],
          badge: 'Calculus Heavy'
        },
        {
          id: 'ch_math_trig_adv',
          title: 'Advanced Trigonometric Functions & Inverses',
          description: 'Inverse trigonometric functions, principal branch values, and multiple/sub-multiple angle transformations.',
          questionCount: 10,
          estimatedMinutes: 15,
          topics: ['Principal Value Branches', 'Compound Angle Formulas', 'Trigonometric Equations'],
          badge: 'Core Analytical'
        },
        {
          id: 'ch_math_vec',
          title: 'Vectors, 3D Geometry & Matrices',
          description: 'Dot and cross products, direction cosines, shortest distance between lines, and matrix determinant operations.',
          questionCount: 10,
          estimatedMinutes: 15,
          topics: ['Scalar & Vector Products', 'Equations of Lines in 3D', 'Matrix Inverses & Cramer Rule'],
          badge: '3D Spatial Math'
        },
        {
          id: 'ch_math_prob_adv',
          title: "Probability & Bayes' Theorem",
          description: 'Conditional probability, independent events, total probability law, and Bayes theorem applications.',
          questionCount: 10,
          estimatedMinutes: 15,
          topics: ["Bayes' Theorem Derivations", 'Random Variables & Expectation', 'Binomial Distribution'],
          badge: 'Exam High-Yield'
        }
      ];
    }

    // 2. SCIENCE & NATURAL WORLD
    if (sId.includes('sci') || sId.includes('phys') || sId.includes('chem') || sId.includes('bio')) {
      if (grade <= 5) {
        return [
          {
            id: 'ch_sci_plants',
            title: 'Plant Anatomy & Germination',
            description: 'Roots, stems, leaves, flowers, photosynthesis basics, and seed dispersal mechanisms.',
            questionCount: 10,
            estimatedMinutes: 12,
            topics: ['Parts of a Plant', 'Photosynthesis Concept', 'Types of Roots'],
            badge: 'Life Sciences'
          },
          {
            id: 'ch_sci_animals',
            title: 'Animal Habitats & Adaptations',
            description: 'Carnivores, herbivores, omnivores, camouflage, hibernation, and ecosystem food chains.',
            questionCount: 10,
            estimatedMinutes: 12,
            topics: ['Terrestrial & Aquatic Animals', 'Food Chains', 'Animal Adaptations'],
            badge: 'Ecosystem'
          },
          {
            id: 'ch_sci_matter',
            title: 'States of Matter, Air & Water',
            description: 'Solids, liquids, gases, melting, evaporation, condensation, and the atmospheric water cycle.',
            questionCount: 10,
            estimatedMinutes: 12,
            topics: ['Properties of Matter', 'Water Cycle Phases', 'Air Composition'],
            badge: 'Physical World'
          }
        ];
      }
      return [
        {
          id: 'ch_sci_light',
          title: 'Light: Reflection, Refraction & Optics',
          description: 'Spherical mirrors, mirror formula, Snell law, lens formula, and optical ray diagrams.',
          questionCount: 10,
          estimatedMinutes: 15,
          topics: ['Ray Diagrams for Concave Mirrors', "Snell's Law of Refraction", 'Lens Power and Focal Length'],
          badge: 'Physics'
        },
        {
          id: 'ch_sci_elec',
          title: "Electricity & Magnetism (Ohm's Law)",
          description: "Potential difference, Ohm's law, series/parallel combinations of resistors, and electromagnetic induction.",
          questionCount: 10,
          estimatedMinutes: 15,
          topics: ["Ohm's Law Verification", 'Resistors in Series & Parallel', "Joule's Law of Heating"],
          badge: 'Physics'
        },
        {
          id: 'ch_sci_chem',
          title: 'Chemical Reactions, Acids & Bases',
          description: 'Balancing equations, displacement, redox reactions, pH scale, indicators, and salt formations.',
          questionCount: 10,
          estimatedMinutes: 15,
          topics: ['Balancing Chemical Equations', 'pH Scale & Indicators', 'Redox & Neutralisation'],
          badge: 'Chemistry'
        },
        {
          id: 'ch_sci_bio',
          title: 'Life Processes & Genetics',
          description: 'Nutrition, human digestive system, respiration, circulation, nephron kidney function, and Mendel laws.',
          questionCount: 10,
          estimatedMinutes: 15,
          topics: ['Human Circulatory System', 'Aerobic vs Anaerobic Respiration', 'Nephron Structure'],
          badge: 'Biology'
        }
      ];
    }

    // 3. ENGLISH LANGUAGE & GRAMMAR
    if (sId.includes('eng')) {
      return [
        {
          id: 'ch_eng_grammar',
          title: 'Grammar Mechanics: Parts of Speech & Tenses',
          description: 'Nouns, pronouns, subject-verb agreement, active/passive voice, and 12 tense structures.',
          questionCount: 10,
          estimatedMinutes: 12,
          topics: ['Subject-Verb Concord', 'Active and Passive Voice', 'Direct and Indirect Speech'],
          badge: 'Core Grammar'
        },
        {
          id: 'ch_eng_vocab',
          title: 'Vocabulary, Idioms & Antonyms',
          description: 'High-frequency root words, prefixes/suffixes, contextual antonyms, and expressive idioms.',
          questionCount: 10,
          estimatedMinutes: 12,
          topics: ['Root Word Families', 'Common Idioms & Metaphors', 'Contextual Synonyms'],
          badge: 'Word Power'
        },
        {
          id: 'ch_eng_comp',
          title: 'Critical Reading Comprehension',
          description: 'Unseen passages, inference questions, tone identification, and central idea deduction.',
          questionCount: 10,
          estimatedMinutes: 15,
          topics: ['Passage Inference', 'Vocabulary in Context', 'Author Tone Analysis'],
          badge: 'Reading Mastery'
        }
      ];
    }

    // 4. SOCIAL SCIENCES
    if (sId.includes('soc') || sId.includes('hist') || sId.includes('geog') || sId.includes('civic')) {
      return [
        {
          id: 'ch_soc_hist',
          title: 'Modern History & National Movements',
          description: 'Key timelines, anti-colonial movements, Satyagraha, and economic impacts of British rule.',
          questionCount: 10,
          estimatedMinutes: 15,
          topics: ['Non-Cooperation & Civil Disobedience', 'Key Historical Treaties', 'Chronology & Source Work'],
          badge: 'History'
        },
        {
          id: 'ch_soc_civics',
          title: 'Indian Constitution & Democratic Institutions',
          description: 'Preamble, Fundamental Rights, separation of powers, Parliament, and Supreme Court Judiciary.',
          questionCount: 10,
          estimatedMinutes: 15,
          topics: ['Fundamental Rights & Duties', 'Electoral Politics', 'Role of the Independent Judiciary'],
          badge: 'Civics'
        },
        {
          id: 'ch_soc_geog',
          title: 'Geography, Resources & Climate Patterns',
          description: 'Resource classification, soil types, Indian monsoon mechanics, agriculture, and map interpretation.',
          questionCount: 10,
          estimatedMinutes: 15,
          topics: ['Soil Conservation', 'Monsoon Mechanism', 'Major Mineral Belts'],
          badge: 'Geography'
        }
      ];
    }

    // Default chapters fallback
    return [
      {
        id: 'ch_gen_foundation',
        title: `${subjectId.toUpperCase()} Core Foundational Concepts`,
        description: `Essential definitions, principles, and fundamental problem-solving in ${board} Class ${grade}.`,
        questionCount: 10,
        estimatedMinutes: 15,
        topics: ['Core Definitions', 'Essential Formulas', 'Basic Concept Applications'],
        badge: 'Fundamental'
      },
      {
        id: 'ch_gen_advanced',
        title: `${subjectId.toUpperCase()} Advanced Analytical Applications`,
        description: `Multi-step reasoning, analytical case scenarios, and board-level problem sets.`,
        questionCount: 10,
        estimatedMinutes: 15,
        topics: ['Analytical Scenarios', 'Complex Problems', 'ExamPYQ Trends'],
        badge: 'Advanced'
      }
    ];
  }
}
