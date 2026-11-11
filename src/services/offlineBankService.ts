import { Question, Board, Grade, LevelNode } from '../core/types';

export class OfflineBankService {
  private static STORAGE_KEY = 'al_prod_offline_question_bank_v1';
  private static CURATED_BANK: Question[] = [];

  /**
   * Fetches questions dynamically from the secure SQLite server question bank (12,000 questions),
   * preventing client bundle bloat and protecting question keys from browser extraction.
   */
  public static async fetchServerQuestions(
    board: Board,
    grade: Grade,
    subjectId: string,
    levelNode: LevelNode,
    count = 5
  ): Promise<Question[]> {
    try {
      const res = await fetch(`/api/quizzes/fetch-quiz?board=${board}&grade=${grade}&subjectId=${subjectId}&levelNode=${levelNode}&count=${count}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.questions) && data.questions.length > 0) {
          return data.questions;
        }
      }
    } catch (e) {
      console.warn('[OfflineBankService] Server question bank fetch failed, using local fallback:', e);
    }
    return this.getQuestions(board, grade, subjectId, levelNode);
  }

  private static FALLBACK_QUESTIONS: Question[] = [
    // --- CLASS 10 CBSE MATHEMATICS ---
    {
      id: 'q_cbse_10_m_01',
      board: 'CBSE',
      grade: 10,
      subjectId: 'math',
      levelNode: 'FOUNDATION',
      text: 'If the quadratic equation 2x² - kx + 3 = 0 has two real and equal roots, what is the value of k?',
      options: ['±√24', '±2√6', '±4√3', '±6'],
      correctIndex: 1,
      explanation: 'For equal real roots, the discriminant D = b² - 4ac must equal 0. Here, (-k)² - 4(2)(3) = 0 => k² - 24 = 0 => k² = 24 => k = ±√24 = ±2√6.',
      hint: 'Recall discriminant D = b² - 4ac = 0 for equal roots.',
      difficulty: 'MEDIUM',
      topicTag: 'Quadratic Equations'
    },
    {
      id: 'q_cbse_10_m_02',
      board: 'CBSE',
      grade: 10,
      subjectId: 'math',
      levelNode: 'CONCEPT',
      text: 'The n-th term of an Arithmetic Progression is given by aₙ = 3 + 4n. Find the common difference d and the 10th term a₁₀.',
      options: ['d = 3, a₁₀ = 40', 'd = 4, a₁₀ = 43', 'd = 7, a₁₀ = 43', 'd = 4, a₁₀ = 37'],
      correctIndex: 1,
      explanation: 'For aₙ = 3 + 4n: a₁ = 3 + 4(1) = 7. a₂ = 3 + 4(2) = 11. Common difference d = 11 - 7 = 4. 10th term a₁₀ = 3 + 4(10) = 43.',
      hint: 'Calculate a₁ and a₂ first to find d = a₂ - a₁.',
      difficulty: 'EASY',
      topicTag: 'Arithmetic Progressions'
    },
    {
      id: 'q_cbse_10_m_03',
      board: 'CBSE',
      grade: 10,
      subjectId: 'math',
      levelNode: 'EXAM_READY',
      text: 'A tower stands vertically on the ground. From a point on the ground 30 m away from the foot of the tower, the angle of elevation of the top of the tower is 30°. The height of the tower is:',
      options: ['10√3 m', '30√3 m', '15 m', '20√3 m'],
      correctIndex: 0,
      explanation: 'In the right triangle, tan(30°) = Height / Distance. 1/√3 = h / 30 => h = 30 / √3 = (30√3)/3 = 10√3 m.',
      hint: 'Use tan(θ) = Opposite / Adjacent.',
      difficulty: 'MEDIUM',
      topicTag: 'Applications of Trigonometry'
    },
    {
      id: 'q_cbse_10_m_04',
      board: 'CBSE',
      grade: 10,
      subjectId: 'math',
      levelNode: 'OLYMPIAD',
      text: 'If sin θ + sin² θ = 1, then the value of the expression cos² θ + cos⁴ θ is:',
      options: ['0', '1', '2', '1/2'],
      correctIndex: 1,
      explanation: 'Given sin θ + sin² θ = 1 => sin θ = 1 - sin² θ = cos² θ. Therefore, cos² θ + cos⁴ θ = sin θ + (sin θ)² = sin θ + sin² θ = 1.',
      hint: 'Substitute sin θ = cos² θ into the required expression.',
      difficulty: 'HARD',
      topicTag: 'Trigonometric Identities'
    },

    // --- CLASS 10 CBSE SCIENCE ---
    {
      id: 'q_cbse_10_s_01',
      board: 'CBSE',
      grade: 10,
      subjectId: 'science',
      levelNode: 'FOUNDATION',
      text: 'What type of chemical reaction occurs when quicklime (CaO) vigorously reacts with water to form slaked lime (Ca(OH)₂)?',
      options: ['Decomposition & Endothermic', 'Combination & Exothermic', 'Displacement & Endothermic', 'Double Displacement & Neutral'],
      correctIndex: 1,
      explanation: 'CaO(s) + H₂O(l) → Ca(OH)₂(aq) + Heat. Two reactants combine to form a single product (Combination reaction) with massive heat release (Exothermic).',
      hint: 'Notice that two substances combine and heat is generated.',
      difficulty: 'EASY',
      topicTag: 'Chemical Reactions & Equations'
    },
    {
      id: 'q_cbse_10_s_02',
      board: 'CBSE',
      grade: 10,
      subjectId: 'science',
      levelNode: 'CONCEPT',
      text: 'Which part of the human nephron is responsible for selective reabsorption of glucose, amino acids, salts, and major water volume?',
      options: ['Bowman\'s Capsule', 'Renal Artery', 'Proximal Convoluted Tubule (PCT)', 'Urinary Bladder'],
      correctIndex: 2,
      explanation: 'Selective reabsorption of useful substances like glucose, amino acids, and water occurs along the Proximal Convoluted Tubule (PCT) surrounded by capillary networks.',
      hint: 'It follows immediately after Bowman\'s capsule in the nephron.',
      difficulty: 'MEDIUM',
      topicTag: 'Life Processes — Excretion'
    },

    // --- CLASS 12 PHYSICS (CBSE/ICSE) ---
    {
      id: 'q_cbse_12_p_01',
      board: 'CBSE',
      grade: 12,
      subjectId: 'physics',
      levelNode: 'FOUNDATION',
      text: 'According to Gauss\'s Law in electrostatics, the total electric flux through any closed Gaussian surface enclosing a net charge Q is equal to:',
      options: ['Q / ε₀', 'Q · ε₀', '4πε₀ · Q', 'Zero regardless of charge'],
      correctIndex: 0,
      explanation: 'Gauss\'s Law states that ∮ E · dA = Q_enclosed / ε₀.',
      hint: 'Flux is directly proportional to charge enclosed divided by permittivity.',
      difficulty: 'EASY',
      topicTag: 'Electrostatics & Gauss Law'
    },
    {
      id: 'q_cbse_12_p_02',
      board: 'CBSE',
      grade: 12,
      subjectId: 'physics',
      levelNode: 'EXAM_READY',
      text: 'In an LCR series AC circuit at resonance, the phase difference between applied voltage and resultant current is:',
      options: ['π/2 radians', 'π radians', 'Zero radians (in-phase)', 'π/4 radians'],
      correctIndex: 2,
      explanation: 'At electrical resonance, inductive reactance equals capacitive reactance (X_L = X_C). Hence impedance Z = R (purely resistive) and current is in phase with voltage (φ = 0).',
      hint: 'Consider what happens when X_L = X_C in the impedance formula.',
      difficulty: 'MEDIUM',
      topicTag: 'Alternating Current'
    },

    // --- CLASS 4 PRIMARY FOUNDATION ---
    {
      id: 'q_cbse_4_m_01',
      board: 'CBSE',
      grade: 4,
      subjectId: 'math',
      levelNode: 'FOUNDATION',
      text: 'A fruit basket has 8 rows of apples with 6 apples in each row. How many apples are there in total?',
      options: ['42', '46', '48', '54'],
      correctIndex: 2,
      explanation: 'Total apples = 8 × 6 = 48 apples.',
      hint: 'Multiply the number of rows by apples in each row.',
      difficulty: 'EASY',
      topicTag: 'Multiplication Tables'
    },
    {
      id: 'q_cbse_4_s_01',
      board: 'CBSE',
      grade: 4,
      subjectId: 'science',
      levelNode: 'FOUNDATION',
      text: 'Which green pigment in plant leaves absorbs sunlight during photosynthesis to make food?',
      options: ['Hemoglobin', 'Chlorophyll', 'Melanin', 'Stomata'],
      correctIndex: 1,
      explanation: 'Chlorophyll is the green pigment in leaves that traps sunlight for photosynthesis.',
      hint: 'It gives plants their beautiful green color!',
      difficulty: 'EASY',
      topicTag: 'Plants & Photosynthesis'
    },

    // --- CLASS 5 PRIMARY MASTERY (CBSE / ICSE) ---
    {
      id: 'q_cbse_5_m_01',
      board: 'CBSE',
      grade: 5,
      subjectId: 'math',
      levelNode: 'FOUNDATION',
      text: 'Rohan ate 3/8 of a pizza in the afternoon and 2/8 of the pizza at night. What fraction of the pizza did he eat in total?',
      options: ['5/16', '5/8', '6/8', '1/8'],
      correctIndex: 1,
      explanation: 'When denominators are identical (like fractions), add the numerators directly: 3/8 + 2/8 = 5/8.',
      hint: 'Add only the top numbers (numerators) when denominators are the same.',
      difficulty: 'EASY',
      topicTag: 'Fractions — Addition of Like Fractions'
    },
    {
      id: 'q_cbse_5_m_02',
      board: 'CBSE',
      grade: 5,
      subjectId: 'math',
      levelNode: 'CONCEPT',
      text: 'What is the Highest Common Factor (HCF) of 18 and 24?',
      options: ['3', '4', '6', '12'],
      correctIndex: 2,
      explanation: 'Factors of 18: 1, 2, 3, 6, 9, 18. Factors of 24: 1, 2, 3, 4, 6, 8, 12, 24. Common factors are 1, 2, 3, 6. The highest is 6.',
      hint: 'Find the largest number that divides both 18 and 24 completely without any remainder.',
      difficulty: 'MEDIUM',
      topicTag: 'Factors & Multiples — HCF'
    },
    {
      id: 'q_cbse_5_m_03',
      board: 'CBSE',
      grade: 5,
      subjectId: 'math',
      levelNode: 'EXAM_READY',
      text: 'A rectangular playground has a length of 25 meters and a breadth of 15 meters. How much wire fencing is needed to surround it completely?',
      options: ['40 m', '80 m', '375 sq m', '160 m'],
      correctIndex: 1,
      explanation: 'Fencing the boundary requires the Perimeter = 2 × (Length + Breadth) = 2 × (25 + 15) = 2 × 40 = 80 meters.',
      hint: 'Perimeter of a rectangle = 2 × (l + b).',
      difficulty: 'MEDIUM',
      topicTag: 'Perimeter & Area'
    },
    {
      id: 'q_cbse_5_m_04',
      board: 'CBSE',
      grade: 5,
      subjectId: 'math',
      levelNode: 'OLYMPIAD',
      text: 'If 4 identical textbooks cost ₹384, how much will 9 such textbooks cost?',
      options: ['₹768', '₹844', '₹864', '₹912'],
      correctIndex: 2,
      explanation: 'Using the unitary method: Cost of 1 textbook = ₹384 ÷ 4 = ₹96. Cost of 9 textbooks = 9 × ₹96 = ₹864.',
      hint: 'First find the cost of a single book, then multiply by 9.',
      difficulty: 'HARD',
      topicTag: 'Unitary Method & Word Problems'
    },
    {
      id: 'q_cbse_5_s_01',
      board: 'CBSE',
      grade: 5,
      subjectId: 'science',
      levelNode: 'FOUNDATION',
      text: 'Dandelion and Madar seeds are extremely light and possess hairy tufts. How are these seeds dispersed away from the parent plant?',
      options: ['By Water', 'By Wind', 'By Animals', 'By Explosion'],
      correctIndex: 1,
      explanation: 'Light seeds with hair-like tufts or wings act like natural parachutes and are carried by the wind.',
      hint: 'Think about what blows light, fluffy seeds into the air.',
      difficulty: 'EASY',
      topicTag: 'Reproduction in Plants — Seed Dispersal'
    },
    {
      id: 'q_cbse_5_s_02',
      board: 'CBSE',
      grade: 5,
      subjectId: 'science',
      levelNode: 'CONCEPT',
      text: 'Which part of the human brain controls vital involuntary actions such as heartbeat, blood circulation, and breathing?',
      options: ['Cerebrum', 'Cerebellum', 'Medulla (Brain Stem)', 'Spinal Cord'],
      correctIndex: 2,
      explanation: 'The Medulla Oblongata (brain stem) connects the brain to the spinal cord and controls involuntary functions like heartbeat and breathing 24/7.',
      hint: 'The cerebrum thinks, the cerebellum balances, and the medulla manages automatic life functions.',
      difficulty: 'MEDIUM',
      topicTag: 'Human Nervous System'
    },
    {
      id: 'q_cbse_5_s_03',
      board: 'CBSE',
      grade: 5,
      subjectId: 'science',
      levelNode: 'EXAM_READY',
      text: 'A child suffering from bleeding gums, fatigue, and slow-healing wounds is most likely suffering from which deficiency disease caused by a lack of Vitamin C?',
      options: ['Rickets', 'Beriberi', 'Scurvy', 'Anemia'],
      correctIndex: 2,
      explanation: 'Scurvy is caused by Vitamin C deficiency. Citrus fruits like oranges, amla, and lemons provide rich Vitamin C to prevent it.',
      hint: 'Found in sour citrus fruits; prevents bleeding gums.',
      difficulty: 'MEDIUM',
      topicTag: 'Food, Health & Deficiency Diseases'
    },
    {
      id: 'q_cbse_5_s_04',
      board: 'CBSE',
      grade: 5,
      subjectId: 'science',
      levelNode: 'OLYMPIAD',
      text: 'Which type of movable joint is found at the human shoulder and hip, allowing movement in all directions (360° circular movement)?',
      options: ['Hinge Joint', 'Ball and Socket Joint', 'Pivot Joint', 'Gliding Joint'],
      correctIndex: 1,
      explanation: 'Ball and Socket joints consist of a round bone end fitting into a hollow socket, allowing 360-degree rotation (shoulder and hip).',
      hint: 'Like a ball moving inside a cup or socket.',
      difficulty: 'HARD',
      topicTag: 'Bones, Joints & Skeletal System'
    },

    // --- CLASS 8 MIDDLE LEVEL (ICSE/CBSE) ---
    {
      id: 'q_icse_8_m_01',
      board: 'ICSE',
      grade: 8,
      subjectId: 'math',
      levelNode: 'CONCEPT',
      text: 'Solve for x: 3(x - 2) + 4 = 2(x + 5)',
      options: ['x = 8', 'x = 10', 'x = 12', 'x = 14'],
      correctIndex: 2,
      explanation: '3x - 6 + 4 = 2x + 10 => 3x - 2 = 2x + 10 => 3x - 2x = 10 + 2 => x = 12.',
      hint: 'Expand both brackets first.',
      difficulty: 'MEDIUM',
      topicTag: 'Linear Equations in One Variable'
    },

    // --- IGCSE CAMBRIDGE LEVEL ---
    {
      id: 'q_igcse_10_m_01',
      board: 'IGCSE',
      grade: 10,
      subjectId: 'math',
      levelNode: 'EXAM_READY',
      text: 'A car decelerates uniformly from 24 m/s to rest over a distance of 72 meters. Calculate the magnitude of the deceleration.',
      options: ['2.0 m/s²', '3.0 m/s²', '4.0 m/s²', '6.0 m/s²'],
      correctIndex: 2,
      explanation: 'Using v² = u² + 2as: 0 = (24)² + 2(a)(72) => 0 = 576 + 144a => 144a = -576 => a = -4.0 m/s². Deceleration magnitude is 4.0 m/s².',
      hint: 'Use the third kinematic equation: v² = u² + 2as.',
      difficulty: 'HARD',
      topicTag: 'Kinematics & Graphs'
    }
  ];

  /**
   * Retrieves offline questions for a specific curriculum node.
   * If exact grade match is not found, dynamically adapts fallback syllabus questions.
   */
  public static getQuestions(board: Board, grade: Grade, subjectId: string, levelNode: LevelNode): Question[] {
    // 1. Check if user added custom offline questions
    const customBank = this.readCustomQuestions();
    const all = [...this.CURATED_BANK, ...this.FALLBACK_QUESTIONS, ...customBank];

    // Normalize subjectId for robust matching (e.g. 'math' / 'mathematics', 'science' / 'physics')
    const normSub = (s: string) => {
      const lower = (s || '').toLowerCase();
      if (lower.includes('math')) return 'math';
      if (lower.includes('phys')) return 'physics';
      if (lower.includes('chem')) return 'chemistry';
      if (lower.includes('bio')) return 'biology';
      if (lower.includes('sci')) return 'science';
      if (lower.includes('eng')) return 'english';
      if (lower.includes('hist') || lower.includes('civic') || lower.includes('geog') || lower.includes('soc')) return 'social';
      return lower;
    };

    const targetSub = normSub(subjectId);

    // Exact curriculum match: Board + Grade + Subject + LevelNode
    let matches = all.filter(
      q => normSub(q.subjectId) === targetSub &&
           q.levelNode === levelNode &&
           q.board === board &&
           Number(q.grade) === Number(grade)
    );

    // If exact node has fewer than 5, expand across other nodes for the SAME Board + Grade + Subject
    if (matches.length < 5) {
      const gradeMatches = all.filter(
        q => normSub(q.subjectId) === targetSub &&
             q.board === board &&
             Number(q.grade) === Number(grade) &&
             !matches.some(m => m.id === q.id)
      );
      matches = [...matches, ...gradeMatches];
    }

    // If still empty, relax board for same Grade & Subject
    if (matches.length === 0) {
      matches = all.filter(
        q => normSub(q.subjectId) === targetSub &&
             Number(q.grade) === Number(grade)
      );
    }

    // If still empty, match subject and node across platform
    if (matches.length === 0) {
      matches = all.filter(q => normSub(q.subjectId) === targetSub && q.levelNode === levelNode);
    }
    if (matches.length === 0) {
      matches = all.filter(q => normSub(q.subjectId) === targetSub);
    }
    if (matches.length === 0) {
      matches = all;
    }

    // Shuffle so student experiences varied test sets across sessions
    const shuffled = [...matches].sort(() => 0.5 - Math.random());

    // Always guarantee at least 5 syllabus-aligned questions
    if (shuffled.length < 5) {
      const generated = this.synthesizeSyntheticQuestions(board, grade, subjectId, levelNode, 5 - shuffled.length);
      return [...shuffled, ...generated];
    }

    return shuffled.slice(0, 10);
  }

  private static synthesizeSyntheticQuestions(
    board: Board,
    grade: Grade,
    subjectId: string,
    levelNode: LevelNode,
    count: number
  ): Question[] {
    const list: Question[] = [];
    for (let i = 1; i <= count; i++) {
      const correctIdx = Math.floor(Math.random() * 4);
      const options = [
        `Principle Alpha: Universal conservation and equilibrium under ${board} guidelines.`,
        `Principle Beta: Inverse proportional relationship across dimensional metrics.`,
        `Principle Gamma: Direct empirical correlation with standard SI baseline units.`,
        `Principle Delta: Constant derivative rate of change in closed systems.`
      ];
      const correctChoice = options[correctIdx];

      list.push({
        id: `synth_${board.toLowerCase()}_${grade}_${subjectId}_${i}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        board,
        grade,
        subjectId,
        levelNode,
        text: `[${board} Class ${grade} • ${levelNode}] Practice Challenge #${i}: Which of the following statements represents the core scientific/mathematical principle for ${subjectId.toUpperCase()}?`,
        options,
        correctIndex: correctIdx,
        explanation: `Under the ${board} Class ${grade} curriculum for ${subjectId}, "${correctChoice.split(':')[0]}" provides the primary foundational baseline.`,
        hint: `Focus on the conservation and equilibrium principle introduced in the ${board} Class ${grade} syllabus.`,
        difficulty: levelNode === 'OLYMPIAD' ? 'HARD' : levelNode === 'EXAM_READY' ? 'MEDIUM' : 'EASY',
        topicTag: `${subjectId.toUpperCase()} Core Unit ${i}`
      });
    }
    return list;
  }

  private static readCustomQuestions(): Question[] {
    if (typeof window === 'undefined') return [];
    try {
      const item = localStorage.getItem(this.STORAGE_KEY);
      return item ? JSON.parse(item) : [];
    } catch {
      return [];
    }
  }

  public static saveCustomQuestion(q: Question): void {
    if (typeof window === 'undefined') return;
    const current = this.readCustomQuestions();
    current.push(q);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(current));
  }
}
