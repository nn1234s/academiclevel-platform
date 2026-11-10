import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Curriculum topics and templates by Grade and Subject
const SYLLABUS_DATA = {
  // --- PRIMARY (Classes 1 - 4) ---
  primary: {
    math: [
      {
        topic: 'Addition & Counting',
        q: (g, b, n) => `If Aryan has ${g * 3 + 2} red marbles and Priya gives him ${g * 2 + 3} blue marbles, how many marbles does he have in total?`,
        calc: (g) => ({ ans: (g * 3 + 2) + (g * 2 + 3), wrong: [(g * 3 + 2) + (g * 2 + 3) - 2, (g * 3 + 2) + (g * 2 + 3) + 3, (g * 3 + 2) + (g * 2 + 3) - 1] }),
        exp: (ans) => `Add both groups together: the total count is ${ans}.`,
        hint: 'Combine both quantities by counting up.'
      },
      {
        topic: 'Shapes & Geometry',
        q: (g, b, n) => `Which of the following geometrical shapes has exactly 3 straight sides and 3 corners?`,
        opts: ['Triangle', 'Square', 'Rectangle', 'Circle'],
        ansIdx: 0,
        exp: () => 'A triangle is defined by having exactly 3 sides and 3 interior vertices.',
        hint: 'Think of a slice of pizza or a sandwich cut in half.'
      },
      {
        topic: 'Place Value & Numbers',
        q: (g, b, n) => `In the number ${g * 100 + 45}, what is the place value of the digit in the tens place?`,
        opts: ['40 (4 Tens)', '4 (4 Ones)', '400 (4 Hundreds)', '45'],
        ansIdx: 0,
        exp: () => 'The tens place represents bundles of ten. 4 in the tens place equals 40.',
        hint: 'Look at the second digit from the right.'
      },
      {
        topic: 'Multiplication & Tables',
        q: (g, b, n) => `A toy box contains ${g + 3} rows of crayons with 5 crayons in each row. How many crayons are there altogether?`,
        calc: (g) => ({ ans: (g + 3) * 5, wrong: [(g + 3) * 5 - 5, (g + 3) * 5 + 5, (g + 3) * 5 - 2] }),
        exp: (ans) => `Multiply number of rows by crayons per row: total = ${ans}.`,
        hint: 'Use repeated addition or the 5 times table.'
      },
      {
        topic: 'Measurement & Time',
        q: (g, b, n) => `How many minutes are there in 1 full hour according to the ${b} primary syllabus?`,
        opts: ['60 Minutes', '100 Minutes', '24 Minutes', '30 Minutes'],
        ansIdx: 0,
        exp: () => 'There are exactly 60 minutes in an hour and 60 seconds in a minute.',
        hint: 'The minute hand travels all the way around the clock face once.'
      }
    ],
    science: [
      {
        topic: 'Plant Life & Senses',
        q: (g, b, n) => `Which part of a plant grows downwards into the soil to absorb water and minerals?`,
        opts: ['Root', 'Flower', 'Leaf', 'Stem'],
        ansIdx: 0,
        exp: () => 'Roots anchor the plant firmly in the soil and absorb water and vital nutrients.',
        hint: 'It is hidden under the ground.'
      },
      {
        topic: 'Living & Non-Living Things',
        q: (g, b, n) => `Which of the following is an essential characteristic of all living organisms?`,
        opts: ['They grow, breathe, and reproduce', 'They never need water or food', 'They are made of plastic or metal', 'They stay the exact same size forever'],
        ansIdx: 0,
        exp: () => 'Living things need food, breathe oxygen/air, grow over time, and can reproduce.',
        hint: 'Think about what humans and animals do every day to stay alive.'
      },
      {
        topic: 'Human Body & Health',
        q: (g, b, n) => `Which sense organ helps humans see bright colors, read books, and observe their surroundings?`,
        opts: ['Eyes', 'Ears', 'Tongue', 'Nose'],
        ansIdx: 0,
        exp: () => 'The eyes receive light from the environment and allow us to see.',
        hint: 'You use them right now to read this quiz question!'
      },
      {
        topic: 'Water & Weather',
        q: (g, b, n) => `When water is heated on a stove and turns into an invisible gas, this process is called:`,
        opts: ['Evaporation', 'Freezing', 'Melting', 'Condensation'],
        ansIdx: 0,
        exp: () => 'Evaporation is the transition of liquid water into water vapour (gas) when heat is applied.',
        hint: 'Think of wet clothes drying outside under the hot sun.'
      }
    ],
    english: [
      {
        topic: 'Nouns & Parts of Speech',
        q: (g, b, n) => `Identify the common noun in the following sentence: "The happy boy kicked the yellow football."`,
        opts: ['football', 'happy', 'kicked', 'yellow'],
        ansIdx: 0,
        exp: () => 'A noun is a naming word for a person, place, or thing. "Football" and "boy" are nouns.',
        hint: 'Look for an object you can kick or hold.'
      },
      {
        topic: 'Vowels & Phonetics',
        q: (g, b, n) => `How many vowels are there in the standard English alphabet (A, E, I, O, U)?`,
        opts: ['5 Vowels', '7 Vowels', '4 Vowels', '6 Vowels'],
        ansIdx: 0,
        exp: () => 'The English alphabet contains 5 standard vowels: A, E, I, O, U.',
        hint: 'Count: A, E, I, O, U.'
      },
      {
        topic: 'Opposites & Antonyms',
        q: (g, b, n) => `What is the exact antonym (opposite word) of "ANCIENT"?`,
        opts: ['Modern', 'Old', 'Historical', 'Distant'],
        ansIdx: 0,
        exp: () => '"Ancient" means belonging to the very distant past; its opposite is "Modern".',
        hint: 'Something brand-new or contemporary.'
      }
    ]
  },

  // --- MIDDLE (Classes 5 - 8) ---
  middle: {
    math: [
      {
        topic: 'Fractions & Decimals',
        q: (g, b, n) => `Evaluate the fraction addition: ${g}/10 + 3/5. Simplify to lowest terms.`,
        calc: (g) => {
          const num = g + 6;
          const den = 10;
          return { ans: `${num}/10`, wrong: [`${g + 3}/15`, `${num + 2}/10`, `${num - 1}/10`] };
        },
        exp: (ans) => `Convert 3/5 to equivalent denominator 10: 3/5 = 6/10. Then add numerators to get ${ans}.`,
        hint: 'Find the lowest common denominator (LCD = 10).'
      },
      {
        topic: 'Algebra & Linear Equations',
        q: (g, b, n) => `Solve for the unknown variable x in the equation: 2x + ${g * 2} = ${g * 2 + 14}`,
        opts: ['x = 7', 'x = 14', 'x = 5', 'x = 9'],
        ansIdx: 0,
        exp: () => 'Subtract constant from both sides: 2x = 14 => x = 7.',
        hint: 'Isolate x by subtracting and then dividing.'
      },
      {
        topic: 'Perimeter & Area',
        q: (g, b, n) => `Find the area of a rectangle with length ${g + 5} cm and breadth 8 cm.`,
        calc: (g) => ({ ans: `${(g + 5) * 8} cm²`, wrong: [`${(g + 5) * 8 - 8} cm²`, `${(g + 5) * 8 + 8} cm²`, `${2 * ((g + 5) + 8)} cm`] }),
        exp: (ans) => `Area of a rectangle = length × breadth = ${ans}.`,
        hint: 'Multiply length by width; units are square centimeters.'
      },
      {
        topic: 'HCF & LCM',
        q: (g, b, n) => `What is the Least Common Multiple (LCM) of 12 and 18?`,
        opts: ['36', '24', '72', '6'],
        ansIdx: 0,
        exp: () => 'Multiples of 12: 12, 24, 36. Multiples of 18: 18, 36. The smallest common multiple is 36.',
        hint: 'Find the smallest number that both 12 and 18 divide into without a remainder.'
      },
      {
        topic: 'Exponents & Powers',
        q: (g, b, n) => `According to laws of indices in ${b} Class ${g}, simplify: a⁴ × a⁵`,
        opts: ['a⁹', 'a²⁰', 'a¹', '2a⁹'],
        ansIdx: 0,
        exp: () => 'When multiplying powers with identical bases, add the exponents: a^(4+5) = a⁹.',
        hint: 'Rule: aᵐ × aⁿ = a^(m+n).'
      }
    ],
    science: [
      {
        topic: 'Cell Biology',
        q: (g, b, n) => `Which organelle is universally termed the "Powerhouse of the Cell" due to ATP generation?`,
        opts: ['Mitochondria', 'Ribosome', 'Golgi Apparatus', 'Endoplasmic Reticulum'],
        ansIdx: 0,
        exp: () => 'Mitochondria generate adenosine triphosphate (ATP), the primary energy currency of biological cells.',
        hint: 'It is responsible for cellular respiration and energy release.'
      },
      {
        topic: 'Acids, Bases & Salts',
        q: (g, b, n) => `What color change is observed when blue litmus paper is dipped into an acidic solution?`,
        opts: ['Turns Red', 'Turns Green', 'Remains Blue', 'Turns Yellow'],
        ansIdx: 0,
        exp: () => 'Acids turn blue litmus red. Bases turn red litmus blue.',
        hint: 'Acids typically cause red color indicators.'
      },
      {
        topic: 'Electricity & Circuits',
        q: (g, b, n) => `In an electric circuit, what is the standard SI unit of electric current?`,
        opts: ['Ampere (A)', 'Volt (V)', 'Ohm (Ω)', 'Watt (W)'],
        ansIdx: 0,
        exp: () => 'Electric current is the rate of charge flow and is measured in Amperes (A).',
        hint: 'Named after André-Marie Ampère.'
      },
      {
        topic: 'Microorganisms',
        q: (g, b, n) => `Which bacterium is commercially responsible for the curdling/setting of milk into curd?`,
        opts: ['Lactobacillus', 'Rhizobium', 'E. coli', 'Streptococcus pneumoniae'],
        ansIdx: 0,
        exp: () => 'Lactobacillus bacteria ferment lactose sugar into lactic acid, causing milk to coagulate into curd.',
        hint: 'The prefix "Lacto-" refers to milk.'
      }
    ],
    social: [
      {
        topic: 'Geography & Earth',
        q: (g, b, n) => `Which imaginary circular line divides the Earth into the Northern and Southern Hemispheres?`,
        opts: ['Equator (0° Latitude)', 'Prime Meridian (0° Longitude)', 'Tropic of Cancer', 'Tropic of Capricorn'],
        ansIdx: 0,
        exp: () => 'The Equator is the zero-degree latitude line dividing Northern and Southern hemispheres.',
        hint: 'It runs around the widest middle belt of planet Earth.'
      },
      {
        topic: 'History & Civilization',
        q: (g, b, n) => `The Great Bath and advanced drainage grid systems were distinctive architectural features of which ancient civilization?`,
        opts: ['Indus Valley (Harappan) Civilization', 'Mesopotamian Empire', 'Ancient Roman Republic', 'Vedic Kingdom'],
        ansIdx: 0,
        exp: () => 'The Indus Valley (Harappan) cities like Mohenjo-daro had paved brick drains and the Great Bath.',
        hint: 'Centred around the Indus river basin in ancient India.'
      },
      {
        topic: 'Civics & Governance',
        q: (g, b, n) => `In the Indian Democratic Constitution, who is the Supreme Commander of the Armed Forces?`,
        opts: ['The President of India', 'The Prime Minister', 'The Chief of Defence Staff', 'The Chief Justice'],
        ansIdx: 0,
        exp: () => 'Article 53(2) of the Indian Constitution designates the President as the Supreme Commander of Armed Forces.',
        hint: 'The official head of state of the Republic of India.'
      }
    ],
    english: [
      {
        topic: 'Grammar & Tenses',
        q: (g, b, n) => `Choose the correct past participle form of the verb "WRITE":`,
        opts: ['Written', 'Wrote', 'Writing', 'Writes'],
        ansIdx: 0,
        exp: () => 'Conjugation: Write (present), Wrote (past), Written (past participle).',
        hint: 'Used after "has", "have", or "had".'
      },
      {
        topic: 'Direct & Indirect Speech',
        q: (g, b, n) => `Convert to reported speech: She said, "I am studying."`,
        opts: ['She said that she was studying.', 'She said that I am studying.', 'She says that she had studied.', 'She told she is studying.'],
        ansIdx: 0,
        exp: () => 'Present continuous tense ("am studying") shifts to past continuous ("was studying") in reported speech.',
        hint: 'Shift the tense back one step into the past.'
      }
    ],
    cs: [
      {
        topic: 'Algorithms & Computing',
        q: (g, b, n) => `In computer programming, what is the term for a loop that never terminates on its own?`,
        opts: ['Infinite Loop', 'Recursive Thread', 'Null Routine', 'Binary Switch'],
        ansIdx: 0,
        exp: () => 'An infinite loop occurs when the loop condition never evaluates to false.',
        hint: 'It runs forever until manually interrupted.'
      },
      {
        topic: 'Data & Networking',
        q: (g, b, n) => `What does the abbreviation "URL" represent in web browsing?`,
        opts: ['Uniform Resource Locator', 'Universal Routing Link', 'Unified Register Language', 'User Request Link'],
        ansIdx: 0,
        exp: () => 'URL stands for Uniform Resource Locator, the global web address of an online resource.',
        hint: 'It specifies where a webpage is located on the internet.'
      }
    ]
  },

  // --- SECONDARY (Classes 9 - 10) ---
  secondary: {
    math: [
      {
        topic: 'Quadratic Equations',
        q: (g, b, n) => `What is the nature of roots for a quadratic equation ax² + bx + c = 0 when the discriminant D = b² - 4ac > 0 and is not a perfect square?`,
        opts: ['Real, distinct, and irrational', 'Real and equal', 'Complex and imaginary', 'Real, distinct, and rational'],
        ansIdx: 0,
        exp: () => 'When D > 0 and non-square, √D remains irrational, yielding two distinct irrational real roots.',
        hint: 'Consider the quadratic formula roots: x = (-b ± √D) / (2a).'
      },
      {
        topic: 'Arithmetic Progressions',
        q: (g, b, n) => `In an AP whose first term is a = ${g * 2} and common difference is d = 3, what is the 15th term?`,
        calc: (g) => ({ ans: (g * 2) + 14 * 3, wrong: [(g * 2) + 14 * 3 - 3, (g * 2) + 14 * 3 + 3, (g * 2) + 15 * 3] }),
        exp: (ans) => `Formula: a₁₅ = a + (15 - 1)d = a + 14d = ${ans}.`,
        hint: 'Use n-th term formula: aₙ = a + (n - 1)d.'
      },
      {
        topic: 'Trigonometry',
        q: (g, b, n) => `Evaluate the trigonometric expression: sin²(30°) + cos²(30°)`,
        opts: ['1', '1/2', '√3/2', '2'],
        ansIdx: 0,
        exp: () => 'The fundamental Pythagorean identity states sin² θ + cos² θ = 1 for any valid angle θ.',
        hint: 'Identity sin²(θ) + cos²(θ) = 1.'
      },
      {
        topic: 'Coordinate Geometry',
        q: (g, b, n) => `Find the distance between points P(0, 0) and Q(6, 8) in a Cartesian plane.`,
        opts: ['10 units', '14 units', '12 units', '8 units'],
        ansIdx: 0,
        exp: () => 'Distance = √( (6-0)² + (8-0)² ) = √(36 + 64) = √100 = 10 units.',
        hint: 'Use distance formula: d = √((x₂ - x₁)² + (y₂ - y₁)²).'
      }
    ],
    science: [
      {
        topic: 'Chemical Reactions',
        q: (g, b, n) => `Which reaction type is represented by: Zn(s) + CuSO₄(aq) → ZnSO₄(aq) + Cu(s)?`,
        opts: ['Displacement Reaction', 'Combination Reaction', 'Decomposition Reaction', 'Double Displacement'],
        ansIdx: 0,
        exp: () => 'Zinc is more reactive than copper; it displaces copper from copper sulfate solution.',
        hint: 'A more reactive metal takes the place of a less reactive metal.'
      },
      {
        topic: 'Carbon Compounds',
        q: (g, b, n) => `What is the unique property of carbon atoms to form long stable covalent chains with other carbon atoms?`,
        opts: ['Catenation', 'Isomerism', 'Electronegativity', 'Combustion'],
        ansIdx: 0,
        exp: () => 'Catenation is the self-linking capacity of carbon atoms through covalent bonds.',
        hint: 'Enables carbon to form millions of organic molecules.'
      },
      {
        topic: 'Optics & Light',
        q: (g, b, n) => `A concave mirror produces a real, inverted image of the same size as the object. Where is the object located?`,
        opts: ['At the Centre of Curvature (C)', 'At the Principal Focus (F)', 'Between Focus and Pole', 'At Infinity'],
        ansIdx: 0,
        exp: () => 'When an object is placed at C of a concave mirror, the image is formed at C, real, inverted, and equal in size.',
        hint: 'Object distance equals 2f (radius of curvature).'
      },
      {
        topic: 'Life Processes',
        q: (g, b, n) => `Which digestive enzyme present in human saliva initiates the breakdown of starch into maltose?`,
        opts: ['Salivary Amylase (Ptyalin)', 'Pepsin', 'Trypsin', 'Lipase'],
        ansIdx: 0,
        exp: () => 'Salivary amylase hydrolyzes complex starch polymers into simpler disaccharides in the mouth.',
        hint: 'Active at pH ~6.8 in the oral cavity.'
      }
    ],
    social: [
      {
        topic: 'Modern History',
        q: (g, b, n) => `The historic Dandi Salt March was launched by Mahatma Gandhi in which year?`,
        opts: ['1930', '1920', '1942', '1919'],
        ansIdx: 0,
        exp: () => 'Mahatma Gandhi began the Civil Disobedience Movement with the Dandi March on March 12, 1930.',
        hint: 'Preceded the Gandhi-Irwin Pact.'
      },
      {
        topic: 'Economics & Development',
        q: (g, b, n) => `Which economic sector includes agriculture, forestry, mining, and fishing?`,
        opts: ['Primary Sector', 'Secondary Sector', 'Tertiary Sector', 'Quaternary Sector'],
        ansIdx: 0,
        exp: () => 'The Primary sector exploits natural resources directly from the Earth.',
        hint: 'Direct extraction of raw natural goods.'
      }
    ],
    english: [
      {
        topic: 'Literary Devices',
        q: (g, b, n) => `Identify the poetic figure of speech in: "The sea was a roaring beast in the midnight tempest."`,
        opts: ['Metaphor', 'Simile', 'Personification', 'Hyperbole'],
        ansIdx: 0,
        exp: () => 'A metaphor makes a direct comparison without using "like" or "as".',
        hint: 'Direct assertion of identity without "like" or "as".'
      }
    ],
    cs: [
      {
        topic: 'Python & Data Structures',
        q: (g, b, n) => `In Python programming, which of the following data types is immutable?`,
        opts: ['Tuple', 'List', 'Dictionary', 'Set'],
        ansIdx: 0,
        exp: () => 'Tuples cannot be modified, resized, or reassigned after creation in Python.',
        hint: 'Enclosed in round parentheses ( ).'
      }
    ]
  },

  // --- SENIOR SECONDARY (Classes 11 - 12) ---
  senior: {
    physics: [
      {
        topic: 'Electrostatics',
        q: (g, b, n) => `According to Coulomb's Law, if the distance between two point charges is halved, the electrostatic force between them:`,
        opts: ['Increases by a factor of 4', 'Halves', 'Doubles', 'Increases by a factor of 16'],
        ansIdx: 0,
        exp: () => 'F ∝ 1/r². If r becomes r/2, F becomes 1/(r/2)² = 4/r², increasing by 4 times.',
        hint: 'Force follows an inverse-square relationship with distance.'
      },
      {
        topic: 'Electromagnetic Induction',
        q: (g, b, n) => `Lenz\'s Law in electromagnetic induction is a direct consequence of which conservation principle?`,
        opts: ['Conservation of Energy', 'Conservation of Charge', 'Conservation of Momentum', 'Conservation of Mass'],
        ansIdx: 0,
        exp: () => 'Lenz\'s law dictates the polarity of induced EMF such that mechanical work is converted to electrical energy, satisfying energy conservation.',
        hint: 'Work done against the opposing magnetic field is converted into electrical energy.'
      },
      {
        topic: 'Optics & Wave Theory',
        q: (g, b, n) => `In Young\'s Double Slit Experiment, what is the fringe width β formula for monochromatic wavelength λ, slit separation d, and screen distance D?`,
        opts: ['β = λD / d', 'β = λd / D', 'β = dD / λ', 'β = 2λD / d'],
        ansIdx: 0,
        exp: () => 'Fringe width β = λD / d in standard interference wave optics.',
        hint: 'Directly proportional to screen distance D and inversely proportional to slit width d.'
      },
      {
        topic: 'Semiconductors',
        q: (g, b, n) => `What type of extrinsic semiconductor is formed when pure Silicon is doped with a trivalent impurity like Boron or Gallium?`,
        opts: ['p-type semiconductor', 'n-type semiconductor', 'Intrinsic semiconductor', 'Superconductor'],
        ansIdx: 0,
        exp: () => 'Trivalent dopants have 3 valence electrons, creating hole majority carriers (p-type).',
        hint: 'Trivalent atoms create positive holes as majority charge carriers.'
      }
    ],
    chemistry: [
      {
        topic: 'Chemical Kinetics',
        q: (g, b, n) => `For a zero-order chemical reaction A → Products, what are the SI units of the rate constant k?`,
        opts: ['mol L⁻¹ s⁻¹', 's⁻¹', 'L mol⁻¹ s⁻¹', 'L² mol⁻² s⁻¹'],
        ansIdx: 0,
        exp: () => 'Rate = k [A]⁰ = k. Therefore units of k match the reaction rate: mol L⁻¹ s⁻¹.',
        hint: 'For zero-order, rate constant units equal rate of reaction units.'
      },
      {
        topic: 'Electrochemistry',
        q: (g, b, n) => `According to Nernst Equation at 298 K, E_cell = E°_cell - (0.0591 / n) log₁₀(Q). What does n represent?`,
        opts: ['Number of moles of electrons transferred in balanced reaction', 'Concentration of electrolyte', 'Gas constant value', 'Number of electrodes'],
        ansIdx: 0,
        exp: () => 'n is the number of moles of electrons exchanged in the balanced redox equation.',
        hint: 'Represents the stoichiometric electrons exchanged in oxidation-reduction.'
      },
      {
        topic: 'Organic Chemistry',
        q: (g, b, n) => `Which named reaction converts an alkyl halide to an alkane with double the number of carbons using sodium metal in dry ether?`,
        opts: ['Wurtz Reaction', 'Friedel-Crafts Reaction', 'Reimer-Tiemann Reaction', 'Aldol Condensation'],
        ansIdx: 0,
        exp: () => '2R-X + 2Na (dry ether) → R-R + 2NaX (Wurtz synthesis of symmetrical alkanes).',
        hint: 'Named after Charles Adolphe Wurtz.'
      }
    ],
    biology: [
      {
        topic: 'Genetics & Inheritance',
        q: (g, b, n) => `In Mendelian dihybrid inheritance, what is the classical phenotypic ratio obtained in the F₂ generation?`,
        opts: ['9 : 3 : 3 : 1', '3 : 1', '1 : 2 : 1', '9 : 7'],
        ansIdx: 0,
        exp: () => 'A dihybrid cross of heterozygous parents (e.g. RrYy × RrYy) yields 9:3:3:1 phenotypic distribution.',
        hint: 'Mendel\'s law of independent assortment ratio.'
      },
      {
        topic: 'Molecular Biology',
        q: (g, b, n) => `Which enzyme is responsible for catalyzing the synthesis of RNA from a DNA template during transcription?`,
        opts: ['DNA-dependent RNA Polymerase', 'DNA Ligase', 'Reverse Transcriptase', 'Topoisomerase'],
        ansIdx: 0,
        exp: () => 'RNA Polymerase binds to the promoter sequence and synthesizes mRNA in the 5\' to 3\' direction.',
        hint: 'Synthesizes RNA using a DNA strand.'
      }
    ],
    math: [
      {
        topic: 'Calculus & Integration',
        q: (g, b, n) => `Evaluate the definite integral: ∫₀^(π/2) sin(x) dx`,
        opts: ['1', '0', 'π/2', '-1'],
        ansIdx: 0,
        exp: () => '[-cos(x)] from 0 to π/2 = -cos(π/2) - (-cos(0)) = 0 + 1 = 1.',
        hint: 'Antiderivative of sin(x) is -cos(x).'
      },
      {
        topic: 'Matrices & Determinants',
        q: (g, b, n) => `If matrix A is invertible of order n × n, then the determinant |A⁻¹| is equal to:`,
        opts: ['1 / |A|', '|A|²', '-|A|', '|A|'],
        ansIdx: 0,
        exp: () => 'A · A⁻¹ = I => |A · A⁻¹| = |A| |A⁻¹| = |I| = 1 => |A⁻¹| = 1 / |A|.',
        hint: 'Use the property |AB| = |A||B| and |I| = 1.'
      },
      {
        topic: 'Vectors & 3D Geometry',
        q: (g, b, n) => `What is the dot product of two perpendicular non-zero vectors u and v?`,
        opts: ['Zero', '1', '|u||v|', '-1'],
        ansIdx: 0,
        exp: () => 'u · v = |u||v| cos(90°) = 0.',
        hint: 'Cosine of 90 degrees equals 0.'
      }
    ],
    cs: [
      {
        topic: 'Data Structures & Algorithms',
        q: (g, b, n) => `Which abstract data structure operates on the Last-In, First-Out (LIFO) order?`,
        opts: ['Stack', 'Queue', 'Linked List', 'Binary Tree'],
        ansIdx: 0,
        exp: () => 'A Stack adds and removes elements from the top (LIFO).',
        hint: 'Like a stack of plates.'
      }
    ],
    commerce: [
      {
        topic: 'Accountancy',
        q: (g, b, n) => `According to the fundamental accounting equation in ${b}, Assets equal:`,
        opts: ['Liabilities + Capital (Owner\'s Equity)', 'Liabilities - Capital', 'Gross Profit - Expenses', 'Cash + Debentures'],
        ansIdx: 0,
        exp: () => 'Accounting equation: Assets = Liabilities + Capital.',
        hint: 'Dual aspect principle of bookkeeping.'
      }
    ],
    english: [
      {
        topic: 'Advanced Comprehension',
        q: (g, b, n) => `In critical literary analysis, what is the term for a dramatic narrative where characters represent abstract moral virtues or historical concepts?`,
        opts: ['Allegory', 'Soliloquy', 'Elegy', 'Monologue'],
        ansIdx: 0,
        exp: () => 'An allegory is a story with a dual literal and symbolic meaning (e.g. Orwell\'s Animal Farm).',
        hint: 'Characters and events symbolize broader spiritual or political meanings.'
      }
    ]
  }
};

const BOARDS = ['CBSE', 'ICSE', 'IGCSE'];
const TIERS = ['FOUNDATION', 'CONCEPT', 'EXAM_READY', 'OLYMPIAD'];

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generateFullBank() {
  const allQuestions = [];
  let counter = 0;

  for (let grade = 1; grade <= 12; grade++) {
    const tierCategory = grade <= 4 ? 'primary' : grade <= 8 ? 'middle' : grade <= 10 ? 'secondary' : 'senior';
    const categorySubjects = SYLLABUS_DATA[tierCategory];

    for (const board of BOARDS) {
      for (const [subjectId, templates] of Object.entries(categorySubjects)) {
        // Skip commerce on IGCSE if not applicable
        if (subjectId === 'commerce' && board === 'IGCSE') continue;

        for (const tier of TIERS) {
          // Generate 2 to 3 questions per template variant
          templates.forEach((tmpl, tIdx) => {
            counter++;
            const qId = `q_${board.toLowerCase()}_g${grade}_${subjectId}_${tier.toLowerCase()}_${counter}`;

            let qText, options, correctIdx, explanation, hint, topicTag;

            if (tmpl.calc) {
              const res = tmpl.calc(grade);
              qText = tmpl.q(grade, board, tier);
              const rawOptions = [String(res.ans), ...res.wrong.map(String)];
              // Randomly shuffle options and update correct index
              correctIdx = Math.floor(Math.random() * 4);
              const shuffled = [...rawOptions];
              // Put correct answer at correctIdx
              [shuffled[0], shuffled[correctIdx]] = [shuffled[correctIdx], shuffled[0]];

              options = shuffled;
              explanation = tmpl.exp(res.ans);
              hint = tmpl.hint;
              topicTag = `${tmpl.topic} (Class ${grade})`;
            } else {
              qText = tmpl.q(grade, board, tier);
              const correctChoice = tmpl.opts[tmpl.ansIdx];
              const otherChoices = tmpl.opts.filter((_, i) => i !== tmpl.ansIdx);

              correctIdx = Math.floor(Math.random() * 4);
              options = [];
              let otherPtr = 0;
              for (let o = 0; o < 4; o++) {
                if (o === correctIdx) {
                  options.push(correctChoice);
                } else {
                  options.push(otherChoices[otherPtr++]);
                }
              }

              explanation = tmpl.exp();
              hint = tmpl.hint;
              topicTag = `${tmpl.topic} (${board} Standard)`;
            }

            allQuestions.push({
              id: qId,
              board,
              grade,
              subjectId,
              levelNode: tier,
              text: qText,
              options,
              correctIndex: correctIdx,
              explanation: `[${board} Class ${grade} Syllabus] ${explanation}`,
              hint,
              difficulty: tier === 'OLYMPIAD' ? 'HARD' : tier === 'EXAM_READY' ? 'MEDIUM' : 'EASY',
              topicTag
            });
          });
        }
      }
    }
  }

  return allQuestions;
}

const bank = generateFullBank();
console.log(`Generated ${bank.length} class-wise curriculum questions!`);

const outputPath = path.resolve(__dirname, '../src/data/curatedQuestionBank.json');
fs.writeFileSync(outputPath, JSON.stringify(bank, null, 2), 'utf8');
console.log(`Saved to ${outputPath}`);
