import { Question, Board, Grade, LevelNode } from '../core/types';
import { CurriculumService } from './curriculumService';

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
    count = 10,
    chapter?: string
  ): Promise<Question[]> {
    try {
      const url = `/api/quizzes/fetch-quiz?board=${board}&grade=${grade}&subjectId=${subjectId}&levelNode=${levelNode}&count=${count}${chapter ? `&chapter=${encodeURIComponent(chapter)}` : ''}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.questions) && data.questions.length > 0) {
          return data.questions;
        }
      }
    } catch (e) {
      console.warn('[OfflineBankService] Server question bank fetch failed, using local fallback:', e);
    }
    return this.getQuestions(board, grade, subjectId, levelNode, count, chapter);
  }

  /**
   * Fetches the distinct curriculum chapters for this board, grade, and subject.
   */
  public static async fetchChapters(
    board: Board,
    grade: Grade,
    subjectId: string
  ): Promise<{ chapter: string; questionCount: number }[]> {
    try {
      const res = await fetch(`/api/quizzes/chapters?board=${board}&grade=${grade}&subjectId=${subjectId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.chapters) && data.chapters.length > 0) {
          return data.chapters;
        }
      }
    } catch {
      // ignore
    }
    return this.getFallbackChapters(grade, subjectId);
  }

  private static FALLBACK_QUESTIONS: Question[] = [
    // --- CLASS 1 CBSE/ICSE MATHEMATICS (Authentic Early Primary Curriculum) ---
    {
      id: 'q_cbse_1_m_01',
      board: 'CBSE',
      grade: 1,
      subjectId: 'math',
      levelNode: 'FOUNDATION',
      text: 'Calculate the sum: What is 4 + 3?',
      options: ['6', '7', '8', '9'],
      correctIndex: 1,
      explanation: 'Counting 4 items and adding 3 more items gives 7 items in total: 4 + 3 = 7.',
      hint: 'Count forward 3 steps from 4: 5, 6, 7.',
      difficulty: 'EASY',
      topicTag: 'Addition & Word Problems'
    },
    {
      id: 'q_cbse_1_m_02',
      board: 'CBSE',
      grade: 1,
      subjectId: 'math',
      levelNode: 'CONCEPT',
      text: 'Aarav has 5 red balloons. His sister gives him 4 more green balloons. How many balloons does Aarav have altogether?',
      options: ['8 balloons', '9 balloons', '10 balloons', '11 balloons'],
      correctIndex: 1,
      explanation: '5 + 4 = 9 balloons altogether in Aarav\'s hand.',
      hint: 'Add 5 and 4 together.',
      difficulty: 'EASY',
      topicTag: 'Addition & Word Problems'
    },
    {
      id: 'q_cbse_1_m_03',
      board: 'CBSE',
      grade: 1,
      subjectId: 'math',
      levelNode: 'EXAM_READY',
      text: 'Subtract: What is 9 - 5?',
      options: ['3', '4', '5', '6'],
      correctIndex: 1,
      explanation: 'Taking away 5 from 9 leaves 4: 9 - 5 = 4.',
      hint: 'Start at 9 and count backwards 5 steps.',
      difficulty: 'EASY',
      topicTag: 'Subtraction & Regrouping'
    },
    {
      id: 'q_cbse_1_m_04',
      board: 'CBSE',
      grade: 1,
      subjectId: 'math',
      levelNode: 'OLYMPIAD',
      text: 'Which 2D shape has exactly 3 straight sides and 3 sharp corners (vertices)?',
      options: ['Circle', 'Triangle', 'Square', 'Rectangle'],
      correctIndex: 1,
      explanation: 'A triangle is a geometric shape with 3 sides and 3 corners.',
      hint: 'Think of a slice of pizza or an ice cream cone tip.',
      difficulty: 'MEDIUM',
      topicTag: '2D Shapes & Spatial Sense'
    },
    {
      id: 'q_cbse_1_m_05',
      board: 'CBSE',
      grade: 1,
      subjectId: 'math',
      levelNode: 'FOUNDATION',
      text: 'Which number comes immediately after 19 when counting forward?',
      options: ['18', '20', '21', '29'],
      correctIndex: 1,
      explanation: 'When counting numbers forward: 18, 19, 20. Twenty comes right after 19.',
      hint: 'What number is 1 more than 19?',
      difficulty: 'EASY',
      topicTag: 'Number Sequences & Place Value'
    },

    // --- CLASS 1 COMPUTER SCIENCE (MS Paint & Hardware Devices) ---
    {
      id: 'q_cbse_1_cs_01',
      board: 'CBSE',
      grade: 1,
      subjectId: 'cs',
      levelNode: 'FOUNDATION',
      text: 'Which tool in MS Paint is used to fill a closed drawing shape with color with just one click?',
      options: ['Pencil Tool', 'Fill with Color (Paint Bucket)', 'Eraser Tool', 'Text Tool'],
      correctIndex: 1,
      explanation: 'The Fill with Color bucket tool pours your chosen color inside any completely closed shape.',
      hint: 'It looks like a tilted bucket spilling paint.',
      difficulty: 'EASY',
      topicTag: 'MS Paint & Creative Drawing Tools'
    },
    {
      id: 'q_cbse_1_cs_02',
      board: 'CBSE',
      grade: 1,
      subjectId: 'cs',
      levelNode: 'CONCEPT',
      text: 'Which part of a computer looks like a television screen and displays pictures, games, and text?',
      options: ['CPU Box', 'Monitor', 'Computer Mouse', 'Keyboard'],
      correctIndex: 1,
      explanation: 'The Monitor is the visual display screen showing everything you do on a computer.',
      hint: 'It is the screen right in front of your eyes!',
      difficulty: 'EASY',
      topicTag: 'Computer Parts & Hardware Devices'
    },
    {
      id: 'q_cbse_1_cs_03',
      board: 'CBSE',
      grade: 1,
      subjectId: 'cs',
      levelNode: 'EXAM_READY',
      text: 'Which part of a computer is called the "Brain of the Computer" because it does all calculations?',
      options: ['Computer Mouse', 'Monitor', 'CPU (Central Processing Unit)', 'Speakers'],
      correctIndex: 2,
      explanation: 'The CPU (Central Processing Unit) processes all commands and is called the brain of the computer.',
      hint: 'It has 3 letters: C-P-U.',
      difficulty: 'EASY',
      topicTag: 'Computer Parts & Hardware Devices'
    },
    {
      id: 'q_cbse_1_cs_04',
      board: 'CBSE',
      grade: 1,
      subjectId: 'cs',
      levelNode: 'OLYMPIAD',
      text: 'Which tool in MS Paint helps you rub out or erase any accidental mistake on your canvas?',
      options: ['Color Palette', 'Brush Tool', 'Eraser Tool', 'Magnifier'],
      correctIndex: 2,
      explanation: 'The Eraser tool rubs out lines or color mistakes on the MS Paint drawing canvas.',
      hint: 'Just like the rubber eraser at the back of your pencil!',
      difficulty: 'EASY',
      topicTag: 'MS Paint & Creative Drawing Tools'
    },
    {
      id: 'q_cbse_1_cs_05',
      board: 'CBSE',
      grade: 1,
      subjectId: 'cs',
      levelNode: 'FOUNDATION',
      text: 'Which handheld device has two buttons and a small wheel in the center to point and click?',
      options: ['Computer Mouse', 'Keyboard', 'Webcam', 'Printer'],
      correctIndex: 0,
      explanation: 'A computer mouse is moved by hand to point, click icons, and scroll web pages.',
      hint: 'It shares its name with a tiny animal that likes cheese!',
      difficulty: 'EASY',
      topicTag: 'Computer Parts & Hardware Devices'
    },

    // --- CLASS 1 EVS / SOCIAL STUDIES (Body Parts, Plants, Animals, Our Planet, Regional Languages) ---
    {
      id: 'q_cbse_1_evs_01',
      board: 'CBSE',
      grade: 1,
      subjectId: 'evs',
      levelNode: 'FOUNDATION',
      text: 'Which of our 5 sense organs helps us to see the colors, flowers, and world around us?',
      options: ['Ears', 'Eyes', 'Nose', 'Tongue'],
      correctIndex: 1,
      explanation: 'We see with our Eyes. The 5 sense organs are eyes (sight), ears (hearing), nose (smell), tongue (taste), and skin (touch).',
      hint: 'You close them when you go to sleep at night.',
      difficulty: 'EASY',
      topicTag: 'My Body Parts & 5 Sense Organs'
    },
    {
      id: 'q_cbse_1_evs_02',
      board: 'CBSE',
      grade: 1,
      subjectId: 'evs',
      levelNode: 'CONCEPT',
      text: 'Which part of a plant grows under the soil and absorbs water from the earth?',
      options: ['Flower', 'Green Leaves', 'Roots', 'Stem'],
      correctIndex: 2,
      explanation: 'Roots grow underground, holding the plant firmly and absorbing water and minerals from the soil.',
      hint: 'They are hidden under the ground.',
      difficulty: 'EASY',
      topicTag: 'Plants Around Us & Green World'
    },
    {
      id: 'q_cbse_1_evs_03',
      board: 'CBSE',
      grade: 1,
      subjectId: 'evs',
      levelNode: 'EXAM_READY',
      text: 'Which of the following animals is a loving domestic pet that barks and guards our home?',
      options: ['Lion', 'Dog', 'Elephant', 'Tiger'],
      correctIndex: 1,
      explanation: 'Dogs are loyal pets that live with us and guard our homes with affection.',
      hint: 'Man\'s best friend that barks: woof woof!',
      difficulty: 'EASY',
      topicTag: 'Animals & Their Homes'
    },
    {
      id: 'q_cbse_1_evs_04',
      board: 'CBSE',
      grade: 1,
      subjectId: 'evs',
      levelNode: 'OLYMPIAD',
      text: 'Which regional language is primarily spoken by people in the Indian state of Maharashtra?',
      options: ['Tamil', 'Marathi', 'Bengali', 'Punjabi'],
      correctIndex: 1,
      explanation: 'Marathi is the primary regional language of Maharashtra.',
      hint: 'The state where Mumbai and Pune are located.',
      difficulty: 'MEDIUM',
      topicTag: 'Regional Languages & Festivals of India'
    },
    {
      id: 'q_cbse_1_evs_05',
      board: 'CBSE',
      grade: 1,
      subjectId: 'evs',
      levelNode: 'FOUNDATION',
      text: 'The festival of lights celebrated across India by lighting clay lamps (diyas) and sharing sweets is:',
      options: ['Holi', 'Diwali', 'Eid', 'Christmas'],
      correctIndex: 1,
      explanation: 'Diwali (Deepavali) is the festival of lights celebrated with oil lamps, rangoli, and sweets.',
      hint: 'People light diyas and candles on this night.',
      difficulty: 'EASY',
      topicTag: 'Regional Languages & Festivals of India'
    },

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
   * Retrieves offline questions for a specific curriculum node or chapter.
   * Groups and organizes questions by chapter rather than random mixed chaos.
   */
  public static getQuestions(
    board: Board,
    grade: Grade,
    subjectId: string,
    levelNode: LevelNode,
    count = 10,
    chapter?: string
  ): Question[] {
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

    // Filter by chapter if provided
    let candidatePool = all;
    if (chapter) {
      const chLower = chapter.toLowerCase();
      const chMatches = all.filter(q => q.topicTag?.toLowerCase().includes(chLower));
      if (chMatches.length > 0) {
        candidatePool = chMatches;
      }
    }

    // Exact curriculum match: Board + Grade + Subject + LevelNode
    let matches = candidatePool.filter(
      q => normSub(q.subjectId) === targetSub &&
           q.levelNode === levelNode &&
           q.board === board &&
           Number(q.grade) === Number(grade)
    );

    // If exact node has fewer than count, expand across other nodes for the SAME Board + Grade + Subject
    if (matches.length < count) {
      const gradeMatches = candidatePool.filter(
        q => normSub(q.subjectId) === targetSub &&
             q.board === board &&
             Number(q.grade) === Number(grade) &&
             !matches.some(m => m.id === q.id)
      );
      matches = [...matches, ...gradeMatches];
    }

    // If still empty, relax board for same Grade & Subject
    if (matches.length === 0) {
      matches = candidatePool.filter(
        q => normSub(q.subjectId) === targetSub &&
             Number(q.grade) === Number(grade)
      );
    }

    // STRICT GRADE ISOLATION: NEVER cross grade boundaries!
    // A Grade 1 student must never be served Grade 5 or Grade 10 questions.
    matches = matches.filter(q => Number(q.grade) === Number(grade));

    // Crucial: Sort by chapter/topicTag so questions are organized chapter-by-chapter!
    const organized = [...matches].sort((a, b) => {
      const topicA = (a.topicTag || '').toLowerCase();
      const topicB = (b.topicTag || '').toLowerCase();
      return topicA.localeCompare(topicB);
    });

    if (organized.length < count) {
      const needed = count - organized.length;
      const generated = this.synthesizeSyntheticQuestions(board, grade, subjectId, levelNode, needed);
      return [...organized, ...generated];
    }

    return organized.slice(0, count);
  }

  public static getFallbackChapters(grade: Grade, subjectId: string): { chapter: string; questionCount: number }[] {
    try {
      const list = CurriculumService.getChaptersForSubject('CBSE', grade, subjectId);
      if (list && list.length > 0) {
        return list.map(c => ({ chapter: c.title, questionCount: c.questionCount }));
      }
    } catch {
      // fallback below
    }
    const norm = (subjectId || '').toLowerCase();
    if (norm.includes('math')) {
      if (grade <= 3) {
        return [
          { chapter: 'Addition & Word Problems', questionCount: 10 },
          { chapter: 'Subtraction & Regrouping', questionCount: 10 },
          { chapter: 'Number Sequences & Place Value', questionCount: 10 },
          { chapter: '2D Shapes & Spatial Sense', questionCount: 10 },
          { chapter: 'Total Arithmetic Revision', questionCount: 10 }
        ];
      }
      if (grade <= 8) {
        return [
          { chapter: 'Integers & Number Line', questionCount: 10 },
          { chapter: 'Rational Numbers & Exponents', questionCount: 10 },
          { chapter: 'Algebraic Expressions & Identities', questionCount: 10 },
          { chapter: 'Linear Equations in One Variable', questionCount: 10 },
          { chapter: 'Ratio, Proportion & Percentages', questionCount: 10 },
          { chapter: 'Geometry & Triangles', questionCount: 10 },
          { chapter: 'Total Arithmetic & Algebra Revision', questionCount: 10 }
        ];
      }
      return [
        { chapter: 'Real Numbers & Polynomials', questionCount: 10 },
        { chapter: 'Linear Equations in Two Variables', questionCount: 10 },
        { chapter: 'Quadratic Equations (Nature of Roots)', questionCount: 10 },
        { chapter: 'Arithmetic Progressions (AP)', questionCount: 10 },
        { chapter: 'Introduction to Trigonometry & Heights/Distances', questionCount: 10 },
        { chapter: 'Coordinate Geometry (Distance Formula)', questionCount: 10 },
        { chapter: 'Circles & Surface Areas', questionCount: 10 },
        { chapter: 'Statistics & Probability', questionCount: 10 },
        { chapter: 'Total Secondary Mathematics Revision', questionCount: 10 }
      ];
    }
    return [
      { chapter: 'Foundational Concepts & Principles', questionCount: 10 },
      { chapter: 'Core Analytical Problem Solving', questionCount: 10 },
      { chapter: 'Exam High-Yield Revision Topics', questionCount: 10 }
    ];
  }

  private static synthesizeSyntheticQuestions(
    board: Board,
    grade: Grade,
    subjectId: string,
    levelNode: LevelNode,
    count: number
  ): Question[] {
    const list: Question[] = [];
    const sId = (subjectId || '').toLowerCase();

    for (let i = 1; i <= count; i++) {
      let text = '';
      let options: string[] = [];
      let correctIndex = 0;
      let explanation = '';
      let hint = '';
      let topicTag = 'Core Practice';

      // 1. MATHEMATICS DYNAMIC GENERATOR
      if (sId.includes('math')) {
        if (grade <= 2) {
          // Grade 1-2 Addition / Subtraction
          const a = (i * 3) % 9 + 2;
          const b = (i * 2) % 7 + 1;
          const sum = a + b;
          text = `Calculate the sum: What is ${a} + ${b}?`;
          options = [`${sum - 1}`, `${sum}`, `${sum + 2}`, `${sum + 1}`];
          correctIndex = 1;
          explanation = `Adding ${a} and ${b} gives ${sum}: ${a} + ${b} = ${sum}.`;
          hint = `Count forward ${b} numbers starting from ${a}.`;
          topicTag = 'Addition & Word Problems';
        } else if (grade <= 5) {
          // Grade 3-5 Multiplication / Fractions
          const a = (i * 3) % 8 + 3;
          const b = (i * 2) % 6 + 4;
          const prod = a * b;
          text = `What is the product of ${a} × ${b}?`;
          options = [`${prod - 2}`, `${prod + 4}`, `${prod}`, `${prod - 4}`];
          correctIndex = 2;
          explanation = `${a} multiplied by ${b} equals ${prod}.`;
          hint = `Recall multiplication tables for ${a}.`;
          topicTag = 'Multiplication Tables & Operations';
        } else if (grade <= 8) {
          // Grade 6-8 Linear Equations / Algebra
          const coeff = (i % 4) + 2;
          const root = (i % 5) + 3;
          const constant = (i * 2) % 9 + 1;
          const rhs = coeff * root + constant;
          text = `Solve for x: ${coeff}x + ${constant} = ${rhs}`;
          options = [`x = ${root - 1}`, `x = ${root + 2}`, `x = ${root}`, `x = ${root + 1}`];
          correctIndex = 2;
          explanation = `${coeff}x = ${rhs} - ${constant} = ${coeff * root} => x = ${root}.`;
          hint = `Subtract ${constant} from both sides, then divide by ${coeff}.`;
          topicTag = 'Linear Equations in One Variable';
        } else if (grade <= 10) {
          // Grade 9-10 Trigonometry & Quadratics
          const trigQ = [
            { t: 'What is the exact value of sin(30°)?', o: ['1/√2', '1/2', '√3/2', '1'], c: 1, e: 'sin(30°) = 1/2.', tag: 'Trigonometry' },
            { t: 'If discriminant D = b² - 4ac > 0, what is the nature of the quadratic roots?', o: ['Two equal real roots', 'Two distinct real roots', 'No real roots', 'Purely imaginary roots'], c: 1, e: 'When D > 0, the equation has two distinct real roots.', tag: 'Quadratic Equations' },
            { t: 'Which trigonometric identity is universally true for any angle θ?', o: ['sin²θ - cos²θ = 1', 'sin²θ + cos²θ = 1', 'tan²θ + 1 = cos²θ', 'sec²θ + tan²θ = 1'], c: 1, e: 'Fundamental Pythagorean identity: sin²θ + cos²θ = 1.', tag: 'Trigonometric Identities' },
            { t: 'In an AP with first term a = 5 and common difference d = 3, find the 10th term a₁₀.', o: ['32', '35', '38', '29'], c: 0, e: 'a₁₀ = a + 9d = 5 + 9(3) = 5 + 27 = 32.', tag: 'Arithmetic Progressions' }
          ];
          const pick = trigQ[(i - 1) % trigQ.length];
          text = pick.t;
          options = pick.o;
          correctIndex = pick.c;
          explanation = pick.e;
          hint = 'Use standard formulas for Class 10 Board syllabus.';
          topicTag = pick.tag;
        } else {
          // Senior Math (Grades 11-12)
          text = `Find the derivative d/dx (x³) with respect to x:`;
          options = ['3x²', '2x³', 'x²', '3x'];
          correctIndex = 0;
          explanation = 'Using the power rule d/dx(xⁿ) = n·xⁿ⁻¹: d/dx(x³) = 3x².';
          hint = 'Bring the exponent down in front and subtract 1 from the power.';
          topicTag = 'Calculus: Derivatives';
        }
      }
      // 2. COMPUTER SCIENCE DYNAMIC GENERATOR
      else if (sId.includes('cs') || sId.includes('comp') || sId.includes('code')) {
        if (grade <= 2) {
          const cs1Q = [
            { t: 'Which tool in MS Paint lets you draw freehand smooth lines just like a pencil?', o: ['Eraser', 'Pencil Tool', 'Text Tool', 'Magnifier'], c: 1, e: 'The Pencil tool allows freehand sketching on the canvas.', tag: 'MS Paint & Creative Drawing Tools' },
            { t: 'Which key on the keyboard is the longest key and puts spaces between words?', o: ['Enter Key', 'Spacebar', 'Backspace', 'Shift Key'], c: 1, e: 'The Spacebar is the widest key on a keyboard used to add blank spaces between words.', tag: 'Computer Parts & Hardware Devices' },
            { t: 'What is the small blinking vertical line on the monitor screen called?', o: ['Pointer', 'Cursor', 'Icon', 'Button'], c: 1, e: 'The cursor blinks on the screen to show where the next typed letter will appear.', tag: 'Smart Machines & Safe Computer Habits' },
            { t: 'Which tool in MS Paint has a palette of red, blue, green, and yellow circles to choose colors?', o: ['Color Palette', 'Eraser', 'Shapes Tool', 'Pencil'], c: 0, e: 'The Color Palette lets you pick any drawing or fill color.', tag: 'MS Paint & Creative Drawing Tools' }
          ];
          const pick = cs1Q[(i - 1) % cs1Q.length];
          text = pick.t;
          options = pick.o;
          correctIndex = pick.c;
          explanation = pick.e;
          hint = 'Think about everyday MS Paint and keyboard tools.';
          topicTag = pick.tag;
        } else if (grade <= 6) {
          const cs5Q = [
            { t: 'In Scratch programming, which block runs the scripts inside it endlessly without stopping?', o: ['Repeat 10', 'Forever Block', 'If-Then', 'Wait 1 Sec'], c: 1, e: 'The Forever control block loops instructions endlessly until the stop sign is clicked.', tag: 'Scratch Game Programming & Loops' },
            { t: 'In HTML, which element tag is used to create the highest level, largest heading on a webpage?', o: ['<p>', '<h6>', '<h1>', '<title>'], c: 2, e: '<h1> defines the largest primary heading in HTML.', tag: 'HTML Web Page Basics' },
            { t: 'Why is it dangerous to share your personal passwords or home address with strangers in online games?', o: ['It slows the computer down', 'It violates cyber safety and compromises your privacy', 'It changes the mouse speed', 'It deletes the game icon'], c: 1, e: 'Cyber safety requires keeping private credentials and location confidential.', tag: 'Cyber Safety & Internet Ethics' }
          ];
          const pick = cs5Q[(i - 1) % cs5Q.length];
          text = pick.t;
          options = pick.o;
          correctIndex = pick.c;
          explanation = pick.e;
          hint = 'Recall standard Scratch blocks and HTML tags.';
          topicTag = pick.tag;
        } else if (grade <= 8) {
          const cs8Q = [
            { t: 'In Python programming, which built-in function displays messages or output onto the screen console?', o: ['echo()', 'print()', 'output()', 'display()'], c: 1, e: 'print() is the standard Python function used to print output to the console.', tag: 'Python Programming Basics' },
            { t: 'In CSS styling, which property is used to change the text color of a paragraph?', o: ['font-style', 'background-color', 'color', 'text-align'], c: 2, e: 'The CSS color property sets the foreground color of text.', tag: 'HTML & CSS Web Development' },
            { t: 'In MIT App Inventor, which workspace view is used to drag buttons, labels, and arrange mobile screen UI?', o: ['Blocks Editor', 'Designer View', 'Terminal', 'Debugger'], c: 1, e: 'The Designer View in App Inventor arranges visual mobile components.', tag: 'MIT App Inventor & Mobile Apps' }
          ];
          const pick = cs8Q[(i - 1) % cs8Q.length];
          text = pick.t;
          options = pick.o;
          correctIndex = pick.c;
          explanation = pick.e;
          hint = 'Python print() and CSS styling syntax.';
          topicTag = pick.tag;
        } else {
          // Grades 9-12
          const cs10Q = [
            { t: 'In Python, what is the output of len(["apple", "banana", "cherry"])?', o: ['2', '3', '4', '15'], c: 1, e: 'len() returns the number of elements in the list: 3 items.', tag: 'Python Programming & Algorithms' },
            { t: 'In SQL database queries, which command is used to retrieve data from a table?', o: ['FETCH', 'GET', 'SELECT', 'EXTRACT'], c: 2, e: 'SELECT is the standard SQL command to query and fetch records from tables.', tag: 'SQL & Relational Database Management' },
            { t: 'Which HTML5 semantic tag represents the introductory navigation bar of a website?', o: ['<header>', '<nav>', '<section>', '<aside>'], c: 1, e: '<nav> specifies a section containing navigation links.', tag: 'HTML5 & Responsive Web Design' }
          ];
          const pick = cs10Q[(i - 1) % cs10Q.length];
          text = pick.t;
          options = pick.o;
          correctIndex = pick.c;
          explanation = pick.e;
          hint = 'Python len() and SQL query commands.';
          topicTag = pick.tag;
        }
      }
      // 3. EVS, SCIENCE & SOCIAL STUDIES DYNAMIC GENERATOR
      else {
        if (grade <= 2) {
          const evs1Q = [
            { t: 'Which of our 5 sense organs helps us to taste yummy ice creams and identify sweet or sour foods?', o: ['Ears', 'Eyes', 'Nose', 'Tongue'], c: 3, e: 'The Tongue has taste buds to detect sweet, salty, sour, and bitter tastes.', tag: 'My Body Parts & 5 Sense Organs' },
            { t: 'Which beautiful part of a plant attracts butterflies and bees with its sweet fragrance and colors?', o: ['Roots', 'Flower', 'Stem', 'Bark'], c: 1, e: 'Flowers are the colorful parts of plants that attract pollinators.', tag: 'Plants Around Us & Green World' },
            { t: 'Which of the following animals lives in water and breathes through gills?', o: ['Dog', 'Fish', 'Cat', 'Sparrow'], c: 1, e: 'Fish live in water and use gills to breathe oxygen.', tag: 'Animals & Their Homes' },
            { t: 'Which bright celestial body in the sky gives our planet Earth light and warmth every morning?', o: ['Moon', 'The Sun', 'Mars', 'Clouds'], c: 1, e: 'The Sun gives natural light and warmth to Earth.', tag: 'Our Planet Earth, Sun & Weather' },
            { t: 'Which regional language is widely spoken in the Indian state of Tamil Nadu?', o: ['Tamil', 'Hindi', 'Bengali', 'Gujarati'], c: 0, e: 'Tamil is the official regional language of Tamil Nadu.', tag: 'Regional Languages & Festivals of India' }
          ];
          const pick = evs1Q[(i - 1) % evs1Q.length];
          text = pick.t;
          options = pick.o;
          correctIndex = pick.c;
          explanation = pick.e;
          hint = 'Think of your 5 senses and nature around you.';
          topicTag = pick.tag;
        } else if (grade <= 5) {
          const sci5Q = [
            { t: 'What is the green pigment in leaves that traps sunlight to help plants perform photosynthesis?', o: ['Hemoglobin', 'Chlorophyll', 'Melanin', 'Stomata'], c: 1, e: 'Chlorophyll absorbs sunlight required for photosynthesis.', tag: 'Plants, Photosynthesis & Forests' },
            { t: 'How many continents exist on our planet Earth?', o: ['5', '6', '7', '8'], c: 2, e: 'There are 7 continents: Asia, Africa, North America, South America, Antarctica, Europe, and Australia.', tag: 'Our Planet Earth: Continents, Oceans & Maps' },
            { t: 'In Indian villages, what is the elected local governing council responsible for local amenities called?', o: ['Municipal Corporation', 'Gram Panchayat', 'Lok Sabha', 'Supreme Court'], c: 1, e: 'Gram Panchayat is the local self-government body in Indian villages.', tag: 'Local Government & Community Helpers' }
          ];
          const pick = sci5Q[(i - 1) % sci5Q.length];
          text = pick.t;
          options = pick.o;
          correctIndex = pick.c;
          explanation = pick.e;
          hint = 'Primary Science & Social Studies syllabus.';
          topicTag = pick.tag;
        } else {
          // Grades 6-10
          const sci10Q = [
            { t: 'According to Newton\'s Second Law of Motion, force is equal to mass multiplied by:', o: ['Velocity', 'Acceleration', 'Distance', 'Momentum'], c: 1, e: 'F = m · a (Force = Mass × Acceleration).', tag: 'Physics: Kinematics & Laws of Motion' },
            { t: 'What is the chemical formula of baking soda used commonly in households?', o: ['NaCl', 'NaHCO₃ (Sodium Hydrogen Carbonate)', 'CaCO₃', 'Na₂CO₃'], c: 1, e: 'Baking soda is sodium hydrogen carbonate (NaHCO₃).', tag: 'Chemistry: Acids, Bases & Salts' },
            { t: 'In the Indian democratic architecture, which institution acts as the highest court of appeal and guardian of the Constitution?', o: ['Parliament', 'Supreme Court of India', 'Election Commission', 'Prime Minister Office'], c: 1, e: 'The Supreme Court of India is the apex judicial body.', tag: 'Democratic Politics & Government Architecture' }
          ];
          const pick = sci10Q[(i - 1) % sci10Q.length];
          text = pick.t;
          options = pick.o;
          correctIndex = pick.c;
          explanation = pick.e;
          hint = 'Class 10 CBSE/ICSE Science & Civics curriculum.';
          topicTag = pick.tag;
        }
      }

      list.push({
        id: `synth_${board.toLowerCase()}_g${grade}_${subjectId}_${i}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        board,
        grade,
        subjectId,
        levelNode,
        text,
        options,
        correctIndex,
        explanation,
        hint,
        difficulty: levelNode === 'OLYMPIAD' ? 'HARD' : levelNode === 'EXAM_READY' ? 'MEDIUM' : 'EASY',
        topicTag
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
