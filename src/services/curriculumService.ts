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
      name: 'Science / EVS',
      icon: '🔬',
      color: 'from-emerald-600 to-teal-600',
      description: 'Environmental Science, Natural World, Matter, Living Organisms, Energy & Everyday Science.',
      grades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      boards: ['CBSE', 'ICSE', 'IGCSE']
    },
    {
      id: 'social',
      name: 'Social Science / General Knowledge',
      icon: '🌍',
      color: 'from-amber-600 to-orange-600',
      description: 'History, Civics, Geography, Economics, Cultural Heritage & General Knowledge.',
      grades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      boards: ['CBSE', 'ICSE', 'IGCSE']
    },
    {
      id: 'english',
      name: 'English',
      icon: '📚',
      color: 'from-sky-600 to-cyan-600',
      description: 'Grammar mechanics, vocabulary enrichment, critical comprehension & literary composition.',
      grades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
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
      id: 'humanities',
      name: 'Integrated Humanities',
      icon: '🏛️',
      color: 'from-amber-700 to-yellow-600',
      description: 'History, Geography, Political Science, Economics & Global Human Societies.',
      grades: [11, 12],
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
   * Generates curriculum practice levels for a given Subject x Grade x Board.
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
   * Calibrated strictly to 3 questions per chapter practice as requested by the user.
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
    const rawChapters = this.getRawChaptersForSubject(board, grade, subjectId);
    // User requirement: "make chapters just 3 questions and each should be unique"
    return rawChapters.map(ch => ({
      ...ch,
      questionCount: 3,
      estimatedMinutes: 5
    }));
  }

  private static getRawChaptersForSubject(board: Board, grade: Grade, subjectId: string): {
    id: string;
    title: string;
    description: string;
    questionCount: number;
    estimatedMinutes: number;
    topics: string[];
    badge: string;
  }[] {
    const sId = (subjectId || '').toLowerCase();

    // 1. MATHEMATICS CHAPTERS (Grade-Calibrated)
    if (sId.includes('math')) {
      if (grade <= 2) {
        return [
          {
            id: 'ch_math_add_p',
            title: 'Addition & Word Problems',
            description: 'Single and 2-digit addition, visual counting models, and daily real-world word problems.',
            questionCount: 10,
            estimatedMinutes: 12,
            topics: ['Single-Digit Addition', '2-Digit Addition without Carry', 'Real-Life Story Problems'],
            badge: 'Essential Foundation'
          },
          {
            id: 'ch_math_sub_p',
            title: 'Subtraction & Regrouping',
            description: 'Taking away, difference comparison, missing addends, and backwards number line counting.',
            questionCount: 10,
            estimatedMinutes: 12,
            topics: ['Basic Subtraction', '2-Digit Subtraction', 'Missing Addends'],
            badge: 'Core Skill'
          },
          {
            id: 'ch_math_num_p',
            title: 'Number Sequences & Place Value',
            description: 'Hundreds, Tens, Ones, Before/After/Between sequences, and greater/smaller comparisons.',
            questionCount: 10,
            estimatedMinutes: 12,
            topics: ['Place Value Models', 'Ascending & Descending Order', 'Skip Counting by 2s and 5s'],
            badge: 'Number Sense'
          },
          {
            id: 'ch_math_geo_p',
            title: '2D Shapes & Spatial Sense',
            description: 'Circles, Triangles, Rectangles, Squares, edges, vertices, and spatial reasoning.',
            questionCount: 10,
            estimatedMinutes: 10,
            topics: ['Flat Shapes Identification', 'Sides and Corners', 'Patterns and Symmetry'],
            badge: 'Visual Math'
          },
          {
            id: 'ch_math_rev_p',
            title: 'Total Arithmetic Revision',
            description: 'Comprehensive grade-level review combining addition, subtraction, and comparison logic.',
            questionCount: 10,
            estimatedMinutes: 15,
            topics: ['Mixed Addition & Subtraction', 'Word Problem Drills', 'Rapid Mental Math'],
            badge: 'Total Revision'
          }
        ];
      }
      if (grade <= 5) {
        return [
          {
            id: 'ch_math_addsub_e',
            title: 'Multi-Digit Addition & Subtraction',
            description: '3-digit and 4-digit addition/subtraction with borrowing, carrying, and multi-step word problems.',
            questionCount: 10,
            estimatedMinutes: 15,
            topics: ['Column Addition with Carry', 'Regrouping across Zeroes', 'Word Problem Scenarios'],
            badge: 'Core Arithmetic'
          },
          {
            id: 'ch_math_mult_e',
            title: 'Multiplication Tables & Operations',
            description: 'Tables 1 to 20, multi-digit multiplication, array grouping, and rate word problems.',
            questionCount: 10,
            estimatedMinutes: 15,
            topics: ['Multiplication Facts 1-20', '2-Digit by 2-Digit Multiplication', 'Word Problems on Product'],
            badge: 'Multiplication'
          },
          {
            id: 'ch_math_div_e',
            title: 'Division & Long Division Remainders',
            description: 'Equal sharing, long division mechanics, finding quotients and remainders, and divisibility rules.',
            questionCount: 10,
            estimatedMinutes: 15,
            topics: ['Division with Remainders', 'Divisibility Rules for 2, 3, 5, 10', 'Real-World Sharing Problems'],
            badge: 'Division'
          },
          {
            id: 'ch_math_frac_e',
            title: 'Fractions & Decimals',
            description: 'Proper, improper, mixed fractions, decimal place values, and unit conversions.',
            questionCount: 10,
            estimatedMinutes: 15,
            topics: ['Like & Unlike Fractions Addition', 'Decimal Expansions', 'Fraction Visual Models'],
            badge: 'High Weightage'
          },
          {
            id: 'ch_math_mens_e',
            title: 'Perimeter, Area & Measurements',
            description: 'Perimeter of rectangles and squares, area formulas, metric units, time, and money.',
            questionCount: 10,
            estimatedMinutes: 15,
            topics: ['Perimeter Formulas', 'Area in Square Units', 'Measurement Conversions'],
            badge: 'Applied Geometry'
          },
          {
            id: 'ch_math_rev_e',
            title: 'Total Arithmetic Revision',
            description: 'Comprehensive review covering addition, subtraction, multiplication, division, and fractions.',
            questionCount: 10,
            estimatedMinutes: 15,
            topics: ['All Four Operations Mixed', 'BODMAS Basics', 'Multi-Step Math Challenges'],
            badge: 'Total Revision'
          }
        ];
      }
      if (grade <= 8) {
        return [
          {
            id: 'ch_math_int_m',
            title: 'Integers & Number Line',
            description: 'Rules of positive and negative numbers, absolute values, rules of signs, and integer operations.',
            questionCount: 10,
            estimatedMinutes: 15,
            topics: ['Integer Addition & Subtraction', 'Rules of Signs in Multiplication', 'Number Line Distances'],
            badge: 'Number Theory'
          },
          {
            id: 'ch_math_rat_m',
            title: 'Rational Numbers & Exponents',
            description: 'Properties of rational numbers, closure, associativity, laws of exponents, and negative powers.',
            questionCount: 10,
            estimatedMinutes: 15,
            topics: ['Rational Operations', 'Laws of Indices & Exponents', 'Scientific Notation'],
            badge: 'Rational Numbers'
          },
          {
            id: 'ch_math_alg_m',
            title: 'Algebraic Expressions & Identities',
            description: 'Monomials, polynomials, standard identities (a+b)², (a-b)², and factorisation.',
            questionCount: 10,
            estimatedMinutes: 15,
            topics: ['Standard Algebraic Identities', 'Combining Like Terms', 'Factorisation Techniques'],
            badge: 'Algebra Core'
          },
          {
            id: 'ch_math_lineq_m',
            title: 'Linear Equations in One Variable',
            description: 'Solving linear equations with variables on one or both sides and applied age/speed word problems.',
            questionCount: 10,
            estimatedMinutes: 15,
            topics: ['Transposition Method', 'Equation Word Problems', 'Cross-Multiplication'],
            badge: 'Linear Equations'
          },
          {
            id: 'ch_math_ratio_m',
            title: 'Ratio, Proportion & Percentages',
            description: 'Unitary method, percentage increase/decrease, profit and loss, and simple interest calculations.',
            questionCount: 10,
            estimatedMinutes: 15,
            topics: ['Ratios & Proportions', 'Profit and Loss Formulas', 'Simple Interest (SI = PRT/100)'],
            badge: 'Commercial Math'
          },
          {
            id: 'ch_math_geom_m',
            title: 'Geometry & Triangles',
            description: 'Lines, angles, angle sum property, triangle congruence criteria (SSS, SAS, ASA, RHS), and polygons.',
            questionCount: 10,
            estimatedMinutes: 15,
            topics: ['Angle Sum Property', 'Triangle Congruence', 'Quadrilaterals Properties'],
            badge: 'Geometry'
          },
          {
            id: 'ch_math_rev_m',
            title: 'Total Arithmetic & Algebra Revision',
            description: 'Master review covering integers, rational numbers, algebra, equations, and commercial math.',
            questionCount: 10,
            estimatedMinutes: 15,
            topics: ['Full Syllabus Review', 'Combined Algebra & Arithmetic', 'Exam PYQs'],
            badge: 'Total Revision'
          }
        ];
      }
      // Grades 9-10
      if (grade <= 10) {
        return [
          {
            id: 'ch_math_real_s',
            title: 'Real Numbers & Polynomials',
            description: 'Fundamental Theorem of Arithmetic, irrationality proofs, zeroes of polynomials, and relationship between zeroes and coefficients.',
            questionCount: 10,
            estimatedMinutes: 15,
            topics: ['HCF/LCM Proofs', 'Relationship Between Zeroes & Coefficients', 'Quadratic Polynomial Graphs'],
            badge: `${board} Unit 1`
          },
          {
            id: 'ch_math_lineq2_s',
            title: 'Linear Equations in Two Variables',
            description: 'Solving linear equations graphically and algebraically (elimination, substitution), consistency conditions.',
            questionCount: 10,
            estimatedMinutes: 15,
            topics: ['Elimination & Substitution', 'Consistency Conditions (a1/a2)', 'Speed, Time & Age Problems'],
            badge: 'Algebra'
          },
          {
            id: 'ch_math_quad_s',
            title: 'Quadratic Equations (Nature of Roots)',
            description: 'Discriminant D = b² - 4ac, nature of roots, quadratic formula, and factorisation methods.',
            questionCount: 10,
            estimatedMinutes: 15,
            topics: ['Discriminant D = b² - 4ac', 'Equal Roots Conditions', 'Word Problems on Speed & Work'],
            badge: 'High Scoring'
          },
          {
            id: 'ch_math_ap_s',
            title: 'Arithmetic Progressions (AP)',
            description: 'General term a_n = a + (n-1)d, sum of first n terms S_n = n/2(2a + (n-1)d), and real-world AP applications.',
            questionCount: 10,
            estimatedMinutes: 15,
            topics: ['n-th Term Formula', 'Sum of n Terms Formula', 'Real-Life AP Applications'],
            badge: 'AP Sequences'
          },
          {
            id: 'ch_math_trig_s',
            title: 'Introduction to Trigonometry & Heights/Distances',
            description: 'Trigonometric ratios (sin, cos, tan), standard angle values (0°, 30°, 45°, 60°, 90°), trigonometric identities (sin²θ+cos²θ=1), and angle of elevation/depression.',
            questionCount: 10,
            estimatedMinutes: 15,
            topics: ['Trig Ratio Definitions', 'Sin²θ + Cos²θ = 1 Identities', 'Heights and Distances'],
            badge: 'Trigonometry'
          },
          {
            id: 'ch_math_coord_s',
            title: 'Coordinate Geometry (Distance Formula)',
            description: 'Distance formula, midpoint formula, section formula for internal division, and area calculations.',
            questionCount: 10,
            estimatedMinutes: 15,
            topics: ['Distance Formula d = √((x2-x1)²+(y2-y1)²)', 'Section & Midpoint Formulas', 'Collinearity of Points'],
            badge: 'Coordinate Math'
          },
          {
            id: 'ch_math_circ_s',
            title: 'Circles & Surface Areas',
            description: 'Theorems on circle tangents (lengths from external points are equal), surface areas and volumes of cylinder, cone, and sphere combinations.',
            questionCount: 10,
            estimatedMinutes: 15,
            topics: ['Tangent Theorems', 'Surface Area Combinations', 'Volume Conversions'],
            badge: 'Mensuration'
          },
          {
            id: 'ch_math_prob_s',
            title: 'Statistics & Probability',
            description: 'Mean, median, mode of grouped data, empirical and classical probability, dice, card, and coin events.',
            questionCount: 10,
            estimatedMinutes: 15,
            topics: ['Mean, Median & Mode Formulas', 'Coin, Dice & Card Probability', 'Complementary Events'],
            badge: 'Statistics'
          },
          {
            id: 'ch_math_rev_s',
            title: 'Total Secondary Mathematics Revision',
            description: 'Full comprehensive Class 10 board exam simulation covering algebra, trigonometry, geometry, and statistics.',
            questionCount: 10,
            estimatedMinutes: 15,
            topics: ['Full Board Exam Simulation', 'Cross-Topic Problems', 'Specimen PYQ Drills'],
            badge: 'Total Revision'
          }
        ];
      }
      // Grades 11-12
      return [
        {
          id: 'ch_math_rel_sr',
          title: 'Relations, Functions & Sets',
          description: 'Types of relations (reflexive, symmetric, transitive, equivalence), one-one and onto functions, and inverse functions.',
          questionCount: 10,
          estimatedMinutes: 15,
          topics: ['Equivalence Relations', 'Injective & Surjective Functions', 'Domain & Range'],
          badge: 'Higher Algebra'
        },
        {
          id: 'ch_math_trig_sr',
          title: 'Advanced Trigonometric Functions & Inverses',
          description: 'Inverse trigonometric functions, principal branch values, compound angles, and trigonometric equations.',
          questionCount: 10,
          estimatedMinutes: 15,
          topics: ['Principal Value Branches', 'Compound Angle Transformations', 'Inverse Trig Properties'],
          badge: 'Trigonometry'
        },
        {
          id: 'ch_math_complex_sr',
          title: 'Complex Numbers & Quadratic Equations',
          description: 'Modulus, argument, polar form of complex numbers, and quadratic equations with complex roots.',
          questionCount: 10,
          estimatedMinutes: 15,
          topics: ['Modulus & Argument', 'Square Root of Complex Numbers', 'Algebra of Complex Numbers'],
          badge: 'Complex Numbers'
        },
        {
          id: 'ch_math_perm_sr',
          title: 'Permutations, Combinations & Binomial Theorem',
          description: 'Fundamental counting principle, nPr and nCr calculations, and general term in binomial expansions.',
          questionCount: 10,
          estimatedMinutes: 15,
          topics: ['Permutations nPr', 'Combinations nCr', 'Binomial Expansion Term'],
          badge: 'Combinatorics'
        },
        {
          id: 'ch_math_calc_sr',
          title: 'Calculus: Limits, Derivatives & Integrals',
          description: 'Differentiation rules, chain rule, definite integrals, and application of derivatives to tangents and maxima.',
          questionCount: 12,
          estimatedMinutes: 20,
          topics: ['Limits and Continuity', 'Chain Rule & Product Rule', 'Definite Integrals Properties'],
          badge: 'Calculus Heavy'
        },
        {
          id: 'ch_math_vec_sr',
          title: 'Vectors & 3D Geometry',
          description: 'Dot and cross products, direction cosines, shortest distance between skew lines, and planes.',
          questionCount: 10,
          estimatedMinutes: 15,
          topics: ['Scalar & Vector Products', 'Equations of Lines in 3D', 'Distance between Lines'],
          badge: '3D Spatial Math'
        },
        {
          id: 'ch_math_prob_sr',
          title: "Probability Distributions & Bayes' Theorem",
          description: 'Conditional probability, independent events, total probability law, and Bayes theorem applications.',
          questionCount: 10,
          estimatedMinutes: 15,
          topics: ["Bayes' Theorem Derivations", 'Random Variables & Expectation', 'Binomial Distribution'],
          badge: 'Probability'
        }
      ];
    }

    // 2. SCIENCE & NATURAL WORLD CHAPTERS
    if (sId.includes('sci') || sId.includes('phys') || sId.includes('chem') || sId.includes('bio')) {
      if (grade <= 2) {
        return [
          {
            id: 'ch_sci_living_p',
            title: 'Living vs Non-Living Things & Plant Anatomy',
            description: 'Characteristics of living things, plant parts (roots, stems, leaves, flowers), and germination.',
            questionCount: 10,
            estimatedMinutes: 12,
            topics: ['Living vs Non-Living', 'Parts of a Plant', 'Seed Germination'],
            badge: 'Living World'
          },
          {
            id: 'ch_sci_animals_p',
            title: 'Animal World, Habitats & Diets',
            description: 'Wild and domestic animals, animal sounds, homes, herbivores, carnivores, and animal babies.',
            questionCount: 10,
            estimatedMinutes: 12,
            topics: ['Herbivores & Carnivores', 'Animal Habitats', 'Animal Babies & Homes'],
            badge: 'Animal World'
          },
          {
            id: 'ch_sci_body_p',
            title: 'Human Body & Five Senses',
            description: 'Sense organs (eyes, ears, nose, tongue, skin), external body parts, personal hygiene, and healthy habits.',
            questionCount: 10,
            estimatedMinutes: 12,
            topics: ['The 5 Senses', 'Body Parts & Care', 'Healthy Food & Habits'],
            badge: 'Human Body'
          },
          {
            id: 'ch_sci_matter_p',
            title: 'States of Matter (Solid, Liquid, Gas)',
            description: 'Recognizing solids, liquids, and gases in daily life, melting of ice, and boiling water.',
            questionCount: 10,
            estimatedMinutes: 12,
            topics: ['Solids, Liquids, Gases', 'Water to Ice & Steam', 'Everyday Materials'],
            badge: 'Matter'
          },
          {
            id: 'ch_sci_earth_p',
            title: 'Weather, Seasons & Earth',
            description: 'Sun, Moon, Stars, summer, winter, rainy seasons, day and night, and environmental care.',
            questionCount: 10,
            estimatedMinutes: 12,
            topics: ['Four Seasons', 'Day and Night Cycle', 'Sun, Moon & Earth'],
            badge: 'Earth & Sky'
          }
        ];
      }
      if (grade <= 5) {
        return [
          {
            id: 'ch_sci_plants_e',
            title: 'Plant Physiology & Photosynthesis',
            description: 'Roots, stems, leaves, flowers, photosynthesis basics, chlorophyll, stomata, and seed dispersal mechanisms.',
            questionCount: 10,
            estimatedMinutes: 12,
            topics: ['Photosynthesis Equation', 'Stomata & Transpiration', 'Seed Dispersal by Wind & Water'],
            badge: 'Plant Science'
          },
          {
            id: 'ch_sci_animals_e',
            title: 'Animal Adaptations & Ecosystem Food Chains',
            description: 'Carnivores, herbivores, omnivores, camouflage, hibernation, terrestrial vs aquatic ecosystems, and food chains.',
            questionCount: 10,
            estimatedMinutes: 12,
            topics: ['Animal Adaptations (Camouflage)', 'Producers & Consumers', 'Food Chains & Food Webs'],
            badge: 'Ecosystems'
          },
          {
            id: 'ch_sci_organs_e',
            title: 'Human Organ Systems (Digestion & Respiration)',
            description: 'Human skeletal system, respiratory organs (lungs), digestive journey, heart circulation basics, and balanced diet.',
            questionCount: 10,
            estimatedMinutes: 12,
            topics: ['Digestive System Organs', 'Respiratory System (Lungs)', 'Nutrients & Balanced Diet'],
            badge: 'Human Physiology'
          },
          {
            id: 'ch_sci_matter_e',
            title: 'States of Matter & Water Cycle',
            description: 'Solids, liquids, gases, melting, evaporation, condensation, freezing, and atmospheric water cycle.',
            questionCount: 10,
            estimatedMinutes: 12,
            topics: ['Particle Arrangement in Matter', 'Evaporation & Condensation', 'Water Cycle Phases'],
            badge: 'Physical World'
          },
          {
            id: 'ch_sci_force_e',
            title: 'Force, Simple Machines & Magnets',
            description: 'Push and pull, gravity, friction, simple machines (lever, pulley, inclined plane), and magnetic attraction/repulsion.',
            questionCount: 10,
            estimatedMinutes: 12,
            topics: ['Types of Forces (Gravity, Friction)', 'Simple Machines in Daily Life', 'Magnetic Poles & Properties'],
            badge: 'Forces & Energy'
          }
        ];
      }
      if (grade <= 8) {
        return [
          {
            id: 'ch_sci_cells_m',
            title: 'Cell Structure & Microorganisms',
            description: 'Plant vs animal cell organelles (cell wall, membrane, nucleus, mitochondria), bacteria, viruses, and fungi.',
            questionCount: 10,
            estimatedMinutes: 15,
            topics: ['Plant vs Animal Cell Comparison', 'Cell Organelles Functions', 'Useful & Harmful Microorganisms'],
            badge: 'Cell Biology'
          },
          {
            id: 'ch_sci_force_m',
            title: 'Force, Friction & Pressure',
            description: 'Contact vs non-contact forces, types of friction (static, sliding, rolling), and pressure formula P = F/A.',
            questionCount: 10,
            estimatedMinutes: 15,
            topics: ['Contact & Non-Contact Forces', 'Methods to Reduce Friction', 'Pressure Calculations (P = F/A)'],
            badge: 'Physics'
          },
          {
            id: 'ch_sci_light_m',
            title: 'Light: Reflection, Refraction & Shadows',
            description: 'Laws of reflection, plane mirror images, concave and convex mirrors/lenses, and dispersion of white light.',
            questionCount: 10,
            estimatedMinutes: 15,
            topics: ['Laws of Reflection (i = r)', 'Concave vs Convex Mirrors', 'Refraction & Lenses'],
            badge: 'Optics'
          },
          {
            id: 'ch_sci_sound_m',
            title: 'Sound, Vibration & Waves',
            description: 'Production of sound by vibrating bodies, amplitude, frequency in Hertz, pitch, loudness, and human ear structure.',
            questionCount: 10,
            estimatedMinutes: 15,
            topics: ['Frequency & Pitch (Hertz)', 'Amplitude & Loudness', 'Medium Requirement for Sound'],
            badge: 'Acoustics'
          },
          {
            id: 'ch_sci_elec_m',
            title: 'Electricity, Circuits & Chemical Effects',
            description: 'Electric current, complete circuits, conductors vs insulators, electroplating, and chemical effects of current.',
            questionCount: 10,
            estimatedMinutes: 15,
            topics: ['Circuit Diagrams & Symbols', 'Conductors & Insulators', 'Electroplating Applications'],
            badge: 'Electricity'
          },
          {
            id: 'ch_sci_chem_m',
            title: 'Chemical Substances, Acids & Bases',
            description: 'Physical vs chemical changes, litmus indicators, acids, bases, salts, and neutralization reactions.',
            questionCount: 10,
            estimatedMinutes: 15,
            topics: ['Physical vs Chemical Changes', 'Litmus & Natural Indicators', 'Acid-Base Neutralization'],
            badge: 'Chemistry'
          }
        ];
      }
      // Grades 9-10
      if (grade <= 10) {
        return [
          {
            id: 'ch_sci_motion_s',
            title: 'Physics: Kinematics, Laws of Motion & Gravitation',
            description: 'Equations of motion (v=u+at, s=ut+½at²), Newton 3 laws (F=ma), Universal Law of Gravitation, and mass vs weight.',
            questionCount: 10,
            estimatedMinutes: 15,
            topics: ['Kinematic Equations of Motion', "Newton's Second Law (F = ma)", 'Universal Law of Gravitation'],
            badge: 'Physics'
          },
          {
            id: 'ch_sci_energy_s',
            title: 'Physics: Work, Energy & Sound Waves',
            description: 'Work done (W=Fd), Kinetic Energy (½mv²), Potential Energy (mgh), Law of conservation of energy, and longitudinal sound waves.',
            questionCount: 10,
            estimatedMinutes: 15,
            topics: ['Work Done Formula W = F × d', 'Kinetic & Potential Energy', 'Conservation of Energy Principle'],
            badge: 'Physics'
          },
          {
            id: 'ch_sci_light_s',
            title: 'Physics: Light, Optics & Human Eye',
            description: 'Mirror formula (1/f = 1/v + 1/u), lens formula (1/f = 1/v - 1/u), lens power (P=1/f), myopia and hypermetropia eye defects.',
            questionCount: 10,
            estimatedMinutes: 15,
            topics: ['Mirror Formula & Ray Diagrams', 'Snell Law & Lens Formula', 'Myopia & Hypermetropia Corrections'],
            badge: 'Optics'
          },
          {
            id: 'ch_sci_elec_s',
            title: 'Physics: Current Electricity & Magnetic Effects',
            description: "Ohm's Law (V=IR), series and parallel resistance, Joule's heating law (H=I²Rt), right-hand thumb rule, and electromagnetic induction.",
            questionCount: 10,
            estimatedMinutes: 15,
            topics: ["Ohm's Law & Resistance", 'Resistors in Series & Parallel', "Joule's Heating & Magnetic Fields"],
            badge: 'Physics'
          },
          {
            id: 'ch_sci_rxn_s',
            title: 'Chemistry: Chemical Reactions & Equations',
            description: 'Balancing chemical equations, combination, decomposition, displacement, double displacement, and oxidation-reduction reactions.',
            questionCount: 10,
            estimatedMinutes: 15,
            topics: ['Balancing Chemical Equations', 'Types of Reactions (Combination/Decomp)', 'Redox Reactions & Corrosion'],
            badge: 'Chemistry'
          },
          {
            id: 'ch_sci_acids_s',
            title: 'Chemistry: Acids, Bases, Salts & Metals',
            description: 'pH scale, properties of acids and bases, preparation of baking soda and bleaching powder, reactivity series of metals.',
            questionCount: 10,
            estimatedMinutes: 15,
            topics: ['pH Scale & Indicators', 'Common Salts (Baking & Washing Soda)', 'Metal Reactivity Series'],
            badge: 'Chemistry'
          },
          {
            id: 'ch_sci_carbon_s',
            title: 'Chemistry: Carbon & Its Compounds',
            description: 'Covalent bonding in carbon, catenation, homologous series (alkanes, alkenes, alkynes), and functional groups (alcohol, acid).',
            questionCount: 10,
            estimatedMinutes: 15,
            topics: ['Tetravalency & Catenation', 'Alkanes, Alkenes & Alkynes', 'Functional Groups & Saponification'],
            badge: 'Organic Chemistry'
          },
          {
            id: 'ch_sci_life_s',
            title: 'Biology: Life Processes (Nutrition, Respiration, Circulation, Excretion)',
            description: 'Autotrophic photosynthesis, human digestive enzymes, aerobic vs anaerobic respiration, double circulation, and nephron excretion.',
            questionCount: 10,
            estimatedMinutes: 15,
            topics: ['Photosynthesis Light Reactions', 'Human Heart & Circulation', 'Nephron Structure & Excretion'],
            badge: 'Biology'
          },
          {
            id: 'ch_sci_hered_s',
            title: 'Biology: Heredity, Evolution & Environment',
            description: 'Mendel laws of inheritance, monohybrid and dihybrid ratios, trophic levels in ecosystems, and biological magnification.',
            questionCount: 10,
            estimatedMinutes: 15,
            topics: ["Mendel's Monohybrid 3:1 Ratio", 'DNA & Gene Inheritance', 'Trophic Levels & 10% Energy Rule'],
            badge: 'Genetics'
          }
        ];
      }
      // Grades 11-12
      return [
        {
          id: 'ch_phys_mech_sr',
          title: 'Physics: Mechanics, Kinematics & Laws of Motion',
          description: 'Vector kinematics, projectile motion, circular motion dynamics, work-energy theorem, and rotational inertia.',
          questionCount: 10,
          estimatedMinutes: 15,
          topics: ['Projectile Motion Trajectory', 'Conservation of Momentum', 'Moment of Inertia Formulas'],
          badge: 'Physics'
        },
        {
          id: 'ch_phys_em_sr',
          title: 'Physics: Electromagnetism, Circuits & Wave Optics',
          description: "Coulomb's Law, Gauss's Theorem, capacitance, Biot-Savart Law, Faraday's electromagnetic induction, and Young's double slit interference.",
          questionCount: 10,
          estimatedMinutes: 15,
          topics: ["Coulomb's & Gauss's Laws", "Electromagnetic Induction & Lenz's Law", "Young's Double Slit Interference"],
          badge: 'Physics'
        },
        {
          id: 'ch_chem_atomic_sr',
          title: 'Chemistry: Atomic Structure & Chemical Bonding',
          description: 'Bohr model, quantum numbers, orbital shapes, VSEPR theory, hybridization (sp, sp2, sp3), and molecular orbital theory.',
          questionCount: 10,
          estimatedMinutes: 15,
          topics: ['Quantum Numbers & Orbitals', 'Hybridization (sp, sp2, sp3)', 'VSEPR Molecular Geometry'],
          badge: 'Chemistry'
        },
        {
          id: 'ch_chem_org_sr',
          title: 'Chemistry: Organic Reaction Mechanisms & Functional Groups',
          description: 'Nucleophilic substitution (SN1, SN2), electrophilic addition, aldehydes, ketones, carboxylic acids, and biomolecules.',
          questionCount: 10,
          estimatedMinutes: 15,
          topics: ['SN1 vs SN2 Mechanisms', 'Aldehydes, Ketones & Carboxylic Acids', 'Aromatic Electrophilic Substitution'],
          badge: 'Organic Chemistry'
        },
        {
          id: 'ch_bio_gen_sr',
          title: 'Biology: Cell Biology, Molecular Genetics & Biotechnology',
          description: 'Cell cycle (mitosis and meiosis), DNA replication, transcription, translation, genetic engineering, and recombinant DNA technology.',
          questionCount: 10,
          estimatedMinutes: 15,
          topics: ['DNA Replication & Transcription', 'Protein Translation Mechanism', 'Recombinant DNA & PCR'],
          badge: 'Molecular Biology'
        }
      ];
    }

    // 4. ENGLISH LANGUAGE & GRAMMAR
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

    // 5. SOCIAL SCIENCES & ENVIRONMENTAL STUDIES (EVS)
    if (sId.includes('evs') || sId.includes('soc') || sId.includes('hist') || sId.includes('geog') || sId.includes('civic')) {
      if (grade <= 2) {
        return [
          {
            id: 'ch_evs_body_p',
            title: 'My Body Parts & 5 Sense Organs',
            description: 'Identifying body parts: eyes, ears, nose, tongue, skin, hands, feet, personal hygiene, and healthy habits.',
            questionCount: 10,
            estimatedMinutes: 10,
            topics: ['The 5 Sense Organs', 'Hands, Legs & Body Movement', 'Cleanliness & Health Habits'],
            badge: 'Body Parts'
          },
          {
            id: 'ch_evs_plants_p',
            title: 'Plants Around Us & Green World',
            description: 'Roots, stems, leaves, flowers, trees vs small plants, watering plants, and caring for green nature.',
            questionCount: 10,
            estimatedMinutes: 10,
            topics: ['Parts of a Plant (Roots, Leaves)', 'Big Trees vs Little Shrubs', 'How Plants Need Water & Sun'],
            badge: 'Plants'
          },
          {
            id: 'ch_evs_animals_p',
            title: 'Animals & Their Homes',
            description: 'Loving pets (dogs, cats), farm helpers (cows, horses), wild animals in jungles, birds in nests, and animal babies.',
            questionCount: 10,
            estimatedMinutes: 10,
            topics: ['Pet & Domestic Animals', 'Wild Animals & Dens', 'Birds & Nests'],
            badge: 'Animals'
          },
          {
            id: 'ch_evs_earth_p',
            title: 'Our Planet Earth, Sun & Weather',
            description: 'The Earth we live on, the Sun giving light and heat, day and night cycle, rainy season, summer, and cold winter.',
            questionCount: 10,
            estimatedMinutes: 10,
            topics: ['Our Planet Earth', 'Sun, Moon & Stars', 'Day, Night & Seasons'],
            badge: 'Our Planet'
          },
          {
            id: 'ch_evs_lang_p',
            title: 'Regional Languages & Festivals of India',
            description: 'Languages of India (Hindi, Tamil, Marathi, Bengali, Telugu, Punjabi) and joyful festivals (Diwali, Eid, Christmas, Holi).',
            questionCount: 10,
            estimatedMinutes: 10,
            topics: ['Regional Languages of India', 'Festivals of Lights & Colors', 'National Symbols of India'],
            badge: 'Regional Languages'
          }
        ];
      }
      if (grade <= 5) {
        return [
          {
            id: 'ch_evs_plants_e',
            title: 'Plants, Photosynthesis & Forests',
            description: 'Photosynthesis equation, chlorophyll, roots absorbing nutrients, types of forests, and protecting trees.',
            questionCount: 10,
            estimatedMinutes: 12,
            topics: ['Photosynthesis Basics', 'Roots & Stems Functions', 'Forests & Saving Nature'],
            badge: 'Plants'
          },
          {
            id: 'ch_evs_body_e',
            title: 'Human Body & Digestive Journey',
            description: 'Teeth types, mouth to stomach digestion, bones, movable joints, and balanced diet nutrition.',
            questionCount: 10,
            estimatedMinutes: 12,
            topics: ['Digestive System', 'Bones & Muscles', 'Healthy Food & Vitamins'],
            badge: 'Body Systems'
          },
          {
            id: 'ch_soc_earth_e',
            title: 'Our Planet Earth: Continents, Oceans & Maps',
            description: 'The 7 continents, 5 oceans, North/South/East/West directions, globe models, and reading physical maps.',
            questionCount: 10,
            estimatedMinutes: 12,
            topics: ['The 7 Continents & 5 Oceans', 'Compass Directions', 'Reading Globes & Maps'],
            badge: 'Our Planet'
          },
          {
            id: 'ch_soc_lang_e',
            title: 'Regional Languages, Culture & Heritage of India',
            description: 'Classical and regional languages of Indian states, traditional clothing, folk dances, and cultural unity in diversity.',
            questionCount: 10,
            estimatedMinutes: 12,
            topics: ['Official Indian Languages', 'States & Their Cultural Heritage', 'Folk Art & National Unity'],
            badge: 'Regional Languages'
          },
          {
            id: 'ch_soc_gov_e',
            title: 'Local Government & Community Helpers',
            description: 'Gram Panchayat in villages, Municipal Corporation in cities, public services, police, firefighters, and doctors.',
            questionCount: 10,
            estimatedMinutes: 12,
            topics: ['Gram Panchayat & Village Governance', 'City Municipal Corporation', 'Community Helpers & Services'],
            badge: 'Government'
          }
        ];
      }
      if (grade <= 8) {
        return [
          {
            id: 'ch_soc_planet_m',
            title: 'Our Planet: Latitudes, Longitudes & Earth Motions',
            description: 'Equator, Prime Meridian, rotation causing day/night, revolution causing seasons, and climate zones.',
            questionCount: 10,
            estimatedMinutes: 15,
            topics: ['Latitudes & Longitudes', 'Rotation & Revolution', 'Torrid, Temperate & Frigid Zones'],
            badge: 'Our Planet'
          },
          {
            id: 'ch_soc_gov_m',
            title: 'Government & Democracy in India',
            description: 'Levels of government (Centre, State, Local), Panchayati Raj, Indian Constitution, and Fundamental Rights & Duties.',
            questionCount: 10,
            estimatedMinutes: 15,
            topics: ['Three Tiers of Government', 'Panchayati Raj System', 'Fundamental Rights & Duties'],
            badge: 'Government'
          },
          {
            id: 'ch_soc_lang_m',
            title: 'Regional Languages & Cultural Diversity of India',
            description: 'Eighth Schedule languages of India, linguistic reorganisation of states, literature, and architectural monuments.',
            questionCount: 10,
            estimatedMinutes: 15,
            topics: ['Scheduled Languages of India', 'State Reorganisation by Language', 'Monuments & Cultural Heritage'],
            badge: 'Regional Languages'
          },
          {
            id: 'ch_soc_hist_m',
            title: 'Medieval India & Delhi Sultanate to Mughals',
            description: 'Major empires, administration, trade routes, craft traditions, and architectural marvels.',
            questionCount: 10,
            estimatedMinutes: 15,
            topics: ['Delhi Sultanate & Mughals', 'Trade & Craft Centers', 'Temple & Fort Architecture'],
            badge: 'History'
          },
          {
            id: 'ch_soc_res_m',
            title: 'Natural Resources, Water & Agriculture',
            description: 'Land resources, soil degradation, freshwater distribution, multi-purpose dams, and major crop patterns.',
            questionCount: 10,
            estimatedMinutes: 15,
            topics: ['Soil & Water Conservation', 'Kharif, Rabi & Zaid Crops', 'Renewable vs Non-Renewable Resources'],
            badge: 'Geography'
          }
        ];
      }
      // Grades 9-10
      return [
        {
          id: 'ch_soc_gov_s',
          title: 'Democratic Politics & Government Architecture',
          description: 'Power sharing, federalism, Parliament (Lok Sabha & Rajya Sabha), Prime Minister & Cabinet, and Independent Judiciary.',
          questionCount: 10,
          estimatedMinutes: 15,
          topics: ['Federalism & Power Sharing', 'Parliament & Electoral Politics', 'Role of the Independent Judiciary'],
          badge: 'Government'
        },
        {
          id: 'ch_soc_planet_s',
          title: 'Our Planet: Resources, Climate & Agriculture',
          description: 'Resource planning, deforestation, Indian monsoon mechanism, cropping seasons, and sustainable development.',
          questionCount: 10,
          estimatedMinutes: 15,
          topics: ['Sustainable Resource Planning', 'Monsoon Climate Dynamics', 'Major Food & Commercial Crops'],
          badge: 'Our Planet'
        },
        {
          id: 'ch_soc_hist_s',
          title: 'Nationalism in India & Freedom Struggle',
          description: 'First World War impact, Satyagraha, Non-Cooperation Movement, Civil Disobedience, Quit India, and partition history.',
          questionCount: 10,
          estimatedMinutes: 15,
          topics: ['Gandhian Satyagraha Movements', 'Civil Disobedience & Dandi March', 'Constitutional Making & Freedom'],
          badge: 'History'
        },
        {
          id: 'ch_soc_econ_s',
          title: 'Economic Development, Sectors & Money',
          description: 'Primary, secondary, and tertiary sectors, organized vs unorganized labor, money, credit, and formal banking.',
          questionCount: 10,
          estimatedMinutes: 15,
          topics: ['Three Sectors of Indian Economy', 'Formal Credit & Banking System', 'Globalization & Consumer Rights'],
          badge: 'Economics'
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
        topics: ['Analytical Scenarios', 'Complex Problems', 'Exam PYQ Trends'],
        badge: 'Advanced'
      }
    ];
  }
}
