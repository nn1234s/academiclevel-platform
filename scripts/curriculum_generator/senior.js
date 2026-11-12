import { makeQ, NAMES, ITEMS, CITIES, pickRandom } from './common.js';

export function getSeniorQuestion(grade, board, node, counter, qId) {
  const name1 = pickRandom(NAMES, counter * 17 + 2);
  const name2 = pickRandom(NAMES, counter * 23 + 4);
  const item = pickRandom(ITEMS, counter * 19 + 6);
  const city = pickRandom(CITIES, counter * 11 + 3);

  // GRADE 11
  if (grade === 11) {
    const variant = counter % 20;
    switch (variant) {
      case 0: {
        const u = ((counter % 40) + 15) * 2; // 30 to 108 m/s
        const angles = [30, 45, 60];
        const theta = angles[counter % 3];
        const sin2theta = theta === 30 ? 0.866 : (theta === 45 ? 1.0 : 0.866);
        const g = 10;
        const R = ((u * u * sin2theta) / g).toFixed(1);
        return makeQ({
          id: qId, board, grade, subjectId: 'physics', levelNode: node,
          text: `In a ballistics trial in ${city}, ${name1} launches a projectile with initial speed u = ${u} m/s at an elevation angle θ = ${theta}° to horizontal. Calculate horizontal RANGE R = (u² sin 2θ) / g (take g = 10 m/s²).`,
          correctOpt: `${R} meters`,
          wrongOpts: [`${(parseFloat(R) + 25).toFixed(1)} m`, `${(parseFloat(R) - 25).toFixed(1)} m`, `${((u * u) / g).toFixed(1)} m`],
          explanation: `Horizontal range R = (u² sin 2θ) / g = (${u}² × ${sin2theta}) / 10 = ${R} m.`,
          hint: 'Formula: R = (u² sin 2θ) / g.',
          topicTag: 'Kinematics: Projectile Motion'
        });
      }
      case 1: {
        const m = (counter % 35) + 3; // 3 to 37 kg
        const r = (counter % 12) + 1; // 1 to 12 m
        const I_ring = m * r * r;
        return makeQ({
          id: qId, board, grade, subjectId: 'physics', levelNode: node,
          text: `In rotational dynamics investigated by ${name1} in ${city}, calculate the MOMENT OF INERTIA of a uniform circular ring of mass M = ${m} kg and radius R = ${r} m about its central symmetry axis perpendicular to the plane (I = MR²).`,
          correctOpt: `${I_ring} kg·m²`,
          wrongOpts: [`${(0.5 * I_ring).toFixed(1)} kg·m²`, `${2 * I_ring} kg·m²`, `${I_ring + 15} kg·m²`],
          explanation: `Moment of Inertia I = MR² = ${m} × (${r})² = ${I_ring} kg·m².`,
          hint: 'Moment of inertia of thin ring I = MR².',
          topicTag: 'Rotational Motion: Moment of Inertia'
        });
      }
      case 2: {
        const nObj = (counter % 12) + 5; // 5 to 16
        const rSub = (counter % 4) + 2;  // 2 to 5
        function fact(num) { let f = 1; for (let i = 2; i <= num; i++) f *= i; return f; }
        const nCr = Math.round(fact(nObj) / (fact(rSub) * fact(nObj - rSub)));
        return makeQ({
          id: qId, board, grade, subjectId: 'math', levelNode: node,
          text: `In combinatorics problems solved by ${name2} in ${city}, calculate the number of distinct combinations ⁿCᵣ when choosing r = ${rSub} objects from a set of n = ${nObj} distinct items: ⁿCᵣ = n! / [r!(n - r)!].`,
          correctOpt: `${nCr}`,
          wrongOpts: [`${nCr * 2}`, `${nCr + 4}`, `${Math.round(fact(nObj) / fact(nObj - rSub))}`],
          explanation: `ⁿCᵣ = ${nObj}! / [${rSub}!(${nObj - rSub})!] = ${nCr}.`,
          hint: 'Formula: nCr = n! / [r!(n-r)!].',
          topicTag: 'Permutations and Combinations'
        });
      }
      case 3: {
        const aFirst = (counter % 25) + 2;
        const ratios = [0.2, 0.25, 0.5, 0.6];
        const rRatio = ratios[counter % ratios.length];
        const sInf = (aFirst / (1 - rRatio)).toFixed(2);
        return makeQ({
          id: qId, board, grade, subjectId: 'math', levelNode: node,
          text: `Find the sum to infinity S_∞ of an infinite Geometric Progression (GP) with first term a = ${aFirst} and common ratio r = ${rRatio} in ${city} using S_∞ = a / (1 - r).`,
          correctOpt: `${sInf}`,
          wrongOpts: [`${(parseFloat(sInf) + 2).toFixed(2)}`, `${(parseFloat(sInf) - 2).toFixed(2)}`, `${(aFirst * 4).toFixed(2)}`],
          explanation: `S_∞ = a / (1 - r) = ${aFirst} / (1 - ${rRatio}) = ${sInf}.`,
          hint: 'Formula: S_∞ = a / (1 - r) for |r| < 1.',
          topicTag: 'Sequences and Series: Infinite GP'
        });
      }
      case 4: {
        const quantumNumbers = [
          { n: 3, l: 2, subshell: '3d subshell', orbitals: '5 degenerate orbitals', maxElectrons: 10, w: ['3p subshell', '4s subshell', '3s subshell'] },
          { n: 4, l: 1, subshell: '4p subshell', orbitals: '3 degenerate orbitals', maxElectrons: 6, w: ['4d subshell', '4s subshell', '3d subshell'] },
          { n: 4, l: 3, subshell: '4f subshell', orbitals: '7 degenerate orbitals', maxElectrons: 14, w: ['4d subshell', '5f subshell', '4p subshell'] },
          { n: 2, l: 0, subshell: '2s subshell', orbitals: '1 spherical orbital', maxElectrons: 2, w: ['2p subshell', '1s subshell', '3s subshell'] }
        ];
        const qn = quantumNumbers[counter % quantumNumbers.length];
        return makeQ({
          id: qId, board, grade, subjectId: 'chemistry', levelNode: node,
          text: `In atomic quantum theory analyzed by ${name1} in ${city}, an electron with principal quantum number n = ${qn.n} and azimuthal quantum number l = ${qn.l} belongs to which subshell (${qn.orbitals}, max ${qn.maxElectrons} e⁻)?`,
          correctOpt: qn.subshell,
          wrongOpts: qn.w,
          explanation: `n = ${qn.n} and l = ${qn.l} defines the ${qn.subshell}. Azimuthal values: s=0, p=1, d=2, f=3.`,
          hint: 'Azimuthal number mapping: 0=s, 1=p, 2=d, 3=f.',
          topicTag: 'Quantum Numbers and Orbitals'
        });
      }
      case 5: {
        const hybridizations = [
          { mol: 'Methane (CH₄)', hyb: 'sp³ hybridization', geom: 'tetrahedral with 109.5° bond angle', w: ['sp² planar', 'sp linear', 'sp³d bipyramidal'] },
          { mol: 'Boron Trifluoride (BF₃)', hyb: 'sp² hybridization', geom: 'trigonal planar with 120° bond angles', w: ['sp³ tetrahedral', 'sp linear', 'sp³d² octahedral'] },
          { mol: 'Beryllium Chloride (BeCl₂)', hyb: 'sp hybridization', geom: 'linear geometry with 180° bond angle', w: ['sp² trigonal', 'sp³ tetrahedral', 'dsp² square planar'] },
          { mol: 'Phosphorus Pentachloride (PCl₅)', hyb: 'sp³d hybridization', geom: 'trigonal bipyramidal geometry', w: ['sp³d² octahedral', 'sp³ tetrahedral', 'sp² planar'] }
        ];
        const hy = hybridizations[counter % hybridizations.length];
        return makeQ({
          id: qId, board, grade, subjectId: 'chemistry', levelNode: node,
          text: `According to VSEPR and Valence Bond Theory, what is the central atom HYBRIDIZATION and molecular geometry of ${hy.mol} studied by ${name2} in ${city}?`,
          correctOpt: `${hy.hyb} (${hy.geom})`,
          wrongOpts: hy.w.map(x => `${x}`),
          explanation: `In ${hy.mol}, the central atom undergoes ${hy.hyb} resulting in ${hy.geom}.`,
          hint: 'Count steric number = bond pairs + lone pairs.',
          topicTag: 'Chemical Bonding: Hybridization'
        });
      }
      case 6: {
        const gibbs = [
          { cond: 'ΔG < 0 (Negative Gibbs Free Energy)', state: 'the chemical or physical process is thermodynamically SPONTANEOUS', w: ['Process is non-spontaneous', 'System is at equilibrium', 'Reaction stops completely'] },
          { cond: 'ΔG = 0', state: 'the reacting system has attained dynamic EQUILIBRIUM', w: ['Spontaneous forward', 'Non-spontaneous', 'Explosive reaction'] },
          { cond: 'ΔG > 0 (Positive Gibbs Free Energy)', state: 'the process is NON-SPONTANEOUS in the forward direction and requires external work', w: ['Spontaneous forward', 'Dynamic equilibrium', 'Exothermic reaction'] }
        ];
        const gb = gibbs[counter % gibbs.length];
        return makeQ({
          id: qId, board, grade, subjectId: 'chemistry', levelNode: node,
          text: `In chemical thermodynamics (ΔG = ΔH - TΔS) evaluated in ${city}, what does the thermodynamic condition "${gb.cond}" indicate?`,
          correctOpt: gb.state,
          wrongOpts: gb.w,
          explanation: `Gibbs Helmholtz criterion states that ${gb.cond} means: ${gb.state}.`,
          hint: 'Spontaneity requires ΔG to be strictly negative.',
          topicTag: 'Chemical Thermodynamics: Gibbs Free Energy'
        });
      }
      case 7: {
        const cellPhases = [
          { phase: 'Metaphase of Mitosis', event: 'chromosomes align symmetrically along the equatorial metaphase plate of the spindle', w: ['Anaphase', 'Prophase', 'Telophase'] },
          { phase: 'Anaphase of Mitosis', event: 'centromeres split and sister chromatids are pulled apart to opposite spindle poles', w: ['Metaphase', 'Telophase', 'Interphase'] },
          { phase: 'Pachytene stage of Prophase I (Meiosis)', event: 'crossing over (genetic recombination) occurs between non-sister chromatids mediated by recombinase enzyme', w: ['Leptotene', 'Zygotene', 'Diplotene'] },
          { phase: 'Telophase of Mitosis', event: 'nuclear envelopes reform around two daughter nuclei and chromosomes decondense into chromatin', w: ['Prophase', 'Metaphase', 'Anaphase'] }
        ];
        const cp = cellPhases[counter % cellPhases.length];
        return makeQ({
          id: qId, board, grade, subjectId: 'biology', levelNode: node,
          text: `In cytogenetics and cell division observed under a microscope by ${name2} in ${city}, during which phase does: "${cp.event}"?`,
          correctOpt: cp.phase,
          wrongOpts: cp.w,
          explanation: `During ${cp.phase}, ${cp.event}.`,
          hint: 'Metaphase = middle alignment; Anaphase = apart movement; Pachytene = crossing over.',
          topicTag: 'Cell Cycle and Cell Division'
        });
      }
      case 8: {
        const bioCycles11 = [
          { name: 'Calvin Cycle (C3 Pathway)', site: 'chloroplast stroma', enzyme: 'RuBisCO fixing CO₂ with RuBP into 3-PGA', w: ['Grana thylakoids', 'Mitochondrial matrix', 'Peroxisome'] },
          { name: 'Glycolysis (EMP Pathway)', site: 'cytoplasm of all living cells', enzyme: 'converts 1 glucose into 2 pyruvates yielding net 2 ATP and 2 NADH without oxygen', w: ['Mitochondrial cristae', 'Nucleus', 'Endoplasmic reticulum'] },
          { name: 'Krebs Cycle (TCA / Citric Acid Cycle)', site: 'mitochondrial matrix', enzyme: 'oxidizes acetyl-CoA into CO₂, NADH, FADH₂, and GTP', w: ['Cytosol', 'Thylakoid lumen', 'Ribosome'] }
        ];
        const bc11 = bioCycles11[counter % bioCycles11.length];
        return makeQ({
          id: qId, board, grade, subjectId: 'biology', levelNode: node,
          text: `In plant and cellular biochemistry studied by ${name1} in ${city}, where does the ${bc11.name} take place (${bc11.enzyme})?`,
          correctOpt: bc11.site,
          wrongOpts: bc11.w,
          explanation: `The ${bc11.name} occurs within the ${bc11.site}.`,
          hint: 'Recall subcellular locations of metabolic pathways.',
          topicTag: 'Cellular Respiration and Photosynthesis'
        });
      }
      case 9: {
        const aRad = (counter % 35) + 2;
        return makeQ({
          id: qId, board, grade, subjectId: 'math', levelNode: node,
          text: `Evaluate the standard calculus limit in ${city}: lim(x → ${aRad}) [ (x² - ${aRad * aRad}) / (x - ${aRad}) ]. What is its exact value?`,
          correctOpt: `${2 * aRad}`,
          wrongOpts: [`${aRad}`, `${aRad * aRad}`, '0'],
          explanation: `Factoring (x² - ${aRad}²) = (x - ${aRad})(x + ${aRad}). Cancelling (x - ${aRad}) gives lim(x → ${aRad}) (x + ${aRad}) = ${2 * aRad}.`,
          hint: 'Factor the numerator as a² - b² = (a-b)(a+b).',
          topicTag: 'Limits and Derivatives'
        });
      }
      case 10: {
        const bernoulli = [
          { app: 'Aerodynamic lift on airplane wings', prin: 'higher air velocity over curved upper wing surface reduces pressure relative to lower flat surface', w: ['Pascal\'s hydrostatic law', 'Stokes\' terminal law', 'Archimedes\' buoyancy'] },
          { app: 'Atomizer / Perfume sprayer', prin: 'high speed air jet creates a low-pressure suction zone drawing liquid up the tube', w: ['Hooke\'s elasticity law', 'Coulomb\'s law', 'Newton\'s cooling law'] }
        ];
        const br = bernoulli[counter % bernoulli.length];
        return makeQ({
          id: qId, board, grade, subjectId: 'physics', levelNode: node,
          text: `According to BERNOULLI'S PRINCIPLE in fluid mechanics investigated in ${city}, why does ${br.app}?`,
          correctOpt: `Because ${br.prin}`,
          wrongOpts: br.w.map(x => `Because of ${x}`),
          explanation: `Bernoulli's principle states that an increase in fluid speed occurs simultaneously with a decrease in static pressure: ${br.prin}.`,
          hint: 'Higher speed corresponds to lower static fluid pressure.',
          topicTag: 'Fluid Dynamics: Bernoulli\'s Principle'
        });
      }
      case 11: {
        const carbocations = [
          { type: 'Tertiary carbocation (3°)', order: 'most stable carbocation due to maximum hyperconjugation and +I electron-donating alkyl groups', w: ['Secondary carbocation (2°)', 'Primary carbocation (1°)', 'Methyl carbocation'] },
          { type: 'Markovnikov\'s Rule', order: 'in the addition of unsymmetrical HX to an unsymmetrical alkene, the acidic H adds to the carbon with more hydrogen atoms', w: ['Anti-Markovnikov addition', 'Saytzeff elimination', 'Hund\'s rule'] }
        ];
        const cbk = carbocations[counter % carbocations.length];
        return makeQ({
          id: qId, board, grade, subjectId: 'chemistry', levelNode: node,
          text: `In organic reaction mechanisms studied by ${name1} in ${city}, which entity is recognized as: "${cbk.order}"?`,
          correctOpt: cbk.type,
          wrongOpts: cbk.w,
          explanation: `${cbk.type} is characterized as: ${cbk.order}.`,
          hint: 'Carbocation stability order: 3° > 2° > 1° > CH3+.',
          topicTag: 'Organic Chemistry: Reaction Intermediates'
        });
      }
      case 12: {
        const m1 = (counter % 20) + 2;
        return makeQ({
          id: qId, board, grade, subjectId: 'math', levelNode: node,
          text: `If straight line L₁ has a slope of m₁ = ${m1} in Cartesian plane in ${city}, what is the slope m₂ of a line L₂ that is strictly PERPENDICULAR to L₁ (m₁ × m₂ = -1)?`,
          correctOpt: `-${(1 / m1).toFixed(2)}`,
          wrongOpts: [`${m1}`, `${(1 / m1).toFixed(2)}`, `-${m1}`],
          explanation: `For perpendicular lines: m₁ × m₂ = -1 => m₂ = -1 / m₁ = -1 / ${m1} = -${(1 / m1).toFixed(2)}.`,
          hint: 'Negative reciprocal slope: m2 = -1/m1.',
          topicTag: 'Straight Lines: Perpendicular Slopes'
        });
      }
      case 13: {
        const biomolecules = [
          { bio: 'Peptide Bond (-CO-NH-)', form: 'condensation covalent linkage formed between α-carboxyl group of one amino acid and α-amino group of another', w: ['Phosphodiester bond', 'Glycosidic bond', 'Disulfide bridge'] },
          { bio: 'Phosphodiester Bond', form: 'covalent bond linking the 3\' carbon of one sugar ring to the 5\' carbon of adjacent nucleotide in nucleic acid polymers', w: ['Peptide bond', 'Hydrogen bond', 'Ester bond'] },
          { bio: 'Competitive Enzyme Inhibition', form: 'inhibitor closely resembles substrate in molecular structure and competes for binding at active site (e.g. malonate inhibiting succinate dehydrogenase)', w: ['Non-competitive inhibition', 'Allosteric activation', 'Denaturation'] }
        ];
        const bm = biomolecules[counter % biomolecules.length];
        return makeQ({
          id: qId, board, grade, subjectId: 'biology', levelNode: node,
          text: `In molecular biochemistry examined by ${name2} in ${city}, which biochemical linkage or mechanism is described as ${bm.form}?`,
          correctOpt: bm.bio,
          wrongOpts: bm.w,
          explanation: `${bm.bio} is defined as: ${bm.form}.`,
          hint: 'Peptide = proteins; Phosphodiester = DNA/RNA backbone.',
          topicTag: 'Biomolecules and Enzyme Kinetics'
        });
      }
      case 14: {
        const lPendulum = ((counter % 15) + 2) * 0.25; // 0.5 to 4 m
        const T = (2 * Math.PI * Math.sqrt(lPendulum / 9.8)).toFixed(2);
        return makeQ({
          id: qId, board, grade, subjectId: 'physics', levelNode: node,
          text: `Find the TIME PERIOD of oscillation T of a simple pendulum with string length l = ${lPendulum} m swinging in ${city} (T = 2π√(l/g), take g = 9.8 m/s²).`,
          correctOpt: `${T} seconds`,
          wrongOpts: [`${(parseFloat(T) + 1).toFixed(2)} s`, `${(parseFloat(T) - 1).toFixed(2)} s`, `${(2 * lPendulum).toFixed(2)} s`],
          explanation: `Time period T = 2π√(l/g) = 2π√(${lPendulum} / 9.8) ≈ ${T} s.`,
          hint: 'Formula: T = 2π√(l/g).',
          topicTag: 'Oscillations: Simple Pendulum'
        });
      }
      case 15: {
        const conic = [
          { curve: 'Parabola', ecc: 'eccentricity e = 1', w: ['Ellipse (e < 1)', 'Hyperbola (e > 1)', 'Circle (e = 0)'] },
          { curve: 'Ellipse', ecc: 'eccentricity e < 1 (0 < e < 1)', w: ['Parabola (e = 1)', 'Hyperbola (e > 1)', 'Straight line'] },
          { curve: 'Hyperbola', ecc: 'eccentricity e > 1', w: ['Parabola (e = 1)', 'Ellipse (e < 1)', 'Circle (e = 0)'] }
        ];
        const cn = conic[counter % conic.length];
        return makeQ({
          id: qId, board, grade, subjectId: 'math', levelNode: node,
          text: `In conic sections analytical geometry studied in ${city}, which planar curve is defined by having ${cn.ecc}?`,
          correctOpt: cn.curve,
          wrongOpts: cn.w,
          explanation: `A ${cn.curve} is characterized by ${cn.ecc}.`,
          hint: 'Circle e=0, Ellipse e<1, Parabola e=1, Hyperbola e>1.',
          topicTag: 'Conic Sections: Eccentricity'
        });
      }
      case 16: {
        const deBroglie = [
          { formula: 'λ = h / p = h / (mv)', name: 'de Broglie wavelength relation', desc: 'postulates wave-particle duality for all matter particles' },
          { formula: 'Δx · Δp ≥ h / (4π)', name: 'Heisenberg\'s Uncertainty Principle', desc: 'states simultaneous determination of exact position and momentum of a subatomic particle is fundamentally impossible' }
        ];
        const dbg = deBroglie[counter % deBroglie.length];
        return makeQ({
          id: qId, board, grade, subjectId: 'chemistry', levelNode: node,
          text: `In quantum chemistry analyzed by ${name1} in ${city}, which physical principle is represented by the formula "${dbg.formula}" (${dbg.desc})?`,
          correctOpt: dbg.name,
          wrongOpts: ['Bohr\'s Orbit Quantization', 'Planck\'s Quantum Law', 'Photoelectric Threshold Equation'].filter(x => x !== dbg.name).slice(0, 3),
          explanation: `The formula ${dbg.formula} corresponds to the ${dbg.name}.`,
          hint: 'Wave-particle duality vs uncertainty relation.',
          topicTag: 'Quantum Chemistry Principles'
        });
      }
      case 17: {
        const dotA = (counter % 20) + 2;
        const dotB = (counter % 15) + 3;
        const dotProd = dotA * dotB;
        return makeQ({
          id: qId, board, grade, subjectId: 'physics', levelNode: node,
          text: `Given two parallel unit-aligned vectors A = ${dotA} î and B = ${dotB} î in ${city}, what is their SCALAR (DOT) PRODUCT A · B?`,
          correctOpt: `${dotProd}`,
          wrongOpts: [`${dotProd + 4}`, `${dotProd - 4}`, '0'],
          explanation: `Scalar dot product A · B = Ax Bx = ${dotA} × ${dotB} = ${dotProd}. (Since î · î = 1).`,
          hint: 'Multiply corresponding scalar components.',
          topicTag: 'Vector Algebra: Dot Product'
        });
      }
      case 18: {
        const polyTerms = (counter % 20) + 4; // 4 to 23
        const totalTerms = polyTerms + 1;
        return makeQ({
          id: qId, board, grade, subjectId: 'math', levelNode: node,
          text: `In the algebraic Binomial expansion of (x + a)^${polyTerms} calculated by ${name2} in ${city}, what is the total number of terms in the expanded series?`,
          correctOpt: `${totalTerms} terms`,
          wrongOpts: [`${polyTerms} terms`, `${polyTerms - 1} terms`, `${2 * polyTerms} terms`],
          explanation: `The binomial expansion of (x + a)ⁿ has exactly n + 1 terms. For n = ${polyTerms}, number of terms = ${polyTerms} + 1 = ${totalTerms}.`,
          hint: 'Number of terms in (x+a)^n is n + 1.',
          topicTag: 'Binomial Theorem'
        });
      }
      default: {
        const gasLaws = [
          { law: 'Ideal Gas Equation: PV = nRT', desc: 'relates pressure, volume, temperature, and moles of an ideal gas', w: ['van der Waals equation', 'Graham\'s effusion law', 'Dalton\'s partial pressures'] },
          { law: 'Adiabatic Process equation: PV^γ = constant', desc: 'thermodynamic process occurring without any heat exchange (ΔQ = 0) with surroundings', w: ['Isothermal PV = const', 'Isobaric process', 'Isochoric process'] }
        ];
        const gl = gasLaws[counter % gasLaws.length];
        return makeQ({
          id: qId, board, grade, subjectId: 'chemistry', levelNode: node,
          text: `In physical gas thermodynamics studied in ${city}, which equation describes ${gl.desc}?`,
          correctOpt: gl.law,
          wrongOpts: gl.w,
          explanation: `${gl.law} represents the ${gl.desc}.`,
          hint: 'Recall thermodynamic state equations.',
          topicTag: 'States of Matter & Gas Laws'
        });
      }
    }
  }

  // GRADE 12
  const variant = counter % 20;
  switch (variant) {
    case 0: {
      const q1 = (counter % 20) + 2; // 2 to 21 μC
      const q2 = (counter % 15) + 3; // 3 to 17 μC
      const distances = [0.5, 1.0, 1.5, 2.0];
      const r = distances[counter % 4];
      const k = 9e9;
      const F = (k * q1 * 1e-6 * q2 * 1e-6 / (r * r)).toFixed(2);
      return makeQ({
        id: qId, board, grade, subjectId: 'physics', levelNode: node,
        text: `In electrostatics in ${city}, two point charges q₁ = +${q1} μC and q₂ = +${q2} μC are separated by r = ${r} m in vacuum. Calculate the repulsive COULOMB FORCE F = k·q₁·q₂ / r² (k = 9 × 10⁹ N·m²/C²).`,
        correctOpt: `${F} N`,
        wrongOpts: [`${(parseFloat(F) + 0.08).toFixed(2)} N`, `${(parseFloat(F) - 0.08).toFixed(2)} N`, `${(parseFloat(F) * 2).toFixed(2)} N`],
        explanation: `F = (9 × 10⁹ × ${q1} × 10⁻⁶ × ${q2} × 10⁻⁶) / ${r}² = ${F} N.`,
        hint: 'Apply Coulomb\'s Law: F = k·q1·q2 / r².',
        topicTag: 'Electrostatics: Coulomb\'s Law'
      });
    }
    case 1: {
      const C = (counter % 25) + 2; // 2 to 26 μF
      const V = ((counter % 20) + 5) * 10; // 50 to 240 V
      const U = (0.5 * C * 1e-6 * V * V).toFixed(3);
      return makeQ({
        id: qId, board, grade, subjectId: 'physics', levelNode: node,
        text: `In capacitor circuit physics tested by ${name1} in ${city}, calculate the electrostatic POTENTIAL ENERGY U stored in a capacitor C = ${C} μF charged across V = ${V} Volts (U = ½CV²).`,
        correctOpt: `${U} Joules`,
        wrongOpts: [`${(parseFloat(U) + 0.05).toFixed(3)} J`, `${(parseFloat(U) - 0.05).toFixed(3)} J`, `${(C * V * 0.001).toFixed(3)} J`],
        explanation: `Energy U = 1/2 × C × V² = 0.5 × (${C} × 10⁻⁶) × (${V})² = ${U} Joules.`,
        hint: 'Formula: U = 1/2 CV².',
        topicTag: 'Electrostatic Potential and Capacitance'
      });
    }
    case 2: {
      const L = (counter % 15) + 1; // 1 to 15 H
      const freqs = [50, 100, 150, 200, 300];
      const wFreq = freqs[counter % freqs.length]; // rad/s
      const XL = wFreq * L;
      return makeQ({
        id: qId, board, grade, subjectId: 'physics', levelNode: node,
        text: `An inductor of inductance L = ${L} Henrys is connected across an AC circuit operating at angular frequency ω = ${wFreq} rad/s in ${city}. What is its INDUCTIVE REACTANCE XL = ωL?`,
        correctOpt: `${XL} Ω`,
        wrongOpts: [`${XL + 50} Ω`, `${XL - 50} Ω`, `${(wFreq / L).toFixed(0)} Ω`],
        explanation: `Inductive Reactance XL = ω × L = ${wFreq} rad/s × ${L} H = ${XL} Ohms.`,
        hint: 'Formula: XL = ωL.',
        topicTag: 'Alternating Current: Inductive Reactance'
      });
    }
    case 3: {
      const aMat = (counter % 15) + 2;
      const bMat = (counter % 10) + 1;
      const cMat = (counter % 8) + 2;
      const dMat = (counter % 12) + 3;
      const det = aMat * dMat - bMat * cMat;
      return makeQ({
        id: qId, board, grade, subjectId: 'math', levelNode: node,
        text: `In linear algebra practiced by ${name2} in ${city}, evaluate the DETERMINANT of the 2×2 matrix A = [[${aMat}, ${bMat}], [${cMat}, ${dMat}]] using det(A) = ad - bc.`,
        correctOpt: `${det}`,
        wrongOpts: [`${det + 3}`, `${det - 3}`, `${aMat * dMat + bMat * cMat}`],
        explanation: `det(A) = (${aMat} × ${dMat}) - (${bMat} × ${cMat}) = ${aMat * dMat} - ${bMat * cMat} = ${det}.`,
        hint: 'Formula: det = ad - bc.',
        topicTag: 'Matrices and Determinants'
      });
    }
    case 4: {
      const nPower = (counter % 8) + 2; // 2 to 9
      const coeff = (counter % 10) + 2; // 2 to 11
      const diffCoeff = coeff * nPower;
      const powerAfter = nPower - 1;
      return makeQ({
        id: qId, board, grade, subjectId: 'math', levelNode: node,
        text: `In differential calculus, find the first derivative dy/dx of the polynomial function y = ${coeff}x^${nPower} with respect to x in ${city}.`,
        correctOpt: `${diffCoeff}x^${powerAfter}`,
        wrongOpts: [`${coeff}x^${powerAfter}`, `${diffCoeff}x^${nPower}`, `${nPower}x^${coeff}`],
        explanation: `d/dx (c · xⁿ) = c · n · xⁿ⁻¹ = ${coeff} × ${nPower} × x^(${nPower} - 1) = ${diffCoeff}x^${powerAfter}.`,
        hint: 'Power rule of differentiation: d/dx(x^n) = n·x^(n-1).',
        topicTag: 'Calculus: Differentiation'
      });
    }
    case 5: {
      const expInt = (counter % 20) + 2;
      return makeQ({
        id: qId, board, grade, subjectId: 'math', levelNode: node,
        text: `Evaluate the standard indefinite integral ∫ e^(${expInt}x) dx in calculus for ${name1} in ${city}.`,
        correctOpt: `(1/${expInt})e^(${expInt}x) + C`,
        wrongOpts: [`${expInt}e^(${expInt}x) + C`, `e^(${expInt}x) + C`, `(1/${expInt + 1})e^(${expInt}x) + C`],
        explanation: `∫ e^(ax) dx = (1/a)e^(ax) + C. For a = ${expInt}, integral = (1/${expInt})e^(${expInt}x) + C.`,
        hint: 'Integration of exponential function: ∫ e^(ax) dx = 1/a e^(ax) + C.',
        topicTag: 'Calculus: Indefinite Integrals'
      });
    }
    case 6: {
      const colligative = [
        { prop: 'Osmotic Pressure (π = CRT)', use: 'widely used method for determining molar masses of synthetic polymers and biomolecules (proteins, DNA)', w: ['Elevation of boiling point', 'Depression of freezing point', 'Relative lowering of vapor pressure'] },
        { prop: 'Depression of Freezing Point (ΔTf = Kf·m)', use: 'utilized in adding ethylene glycol antifreeze to vehicle radiators in sub-zero snowy winters', w: ['Osmotic pressure', 'Boiling elevation', 'Henry\'s law'] },
        { prop: 'van \'t Hoff Factor i', use: 'measures the degree of dissociation or association of solute molecules in an electrolytic solution', w: ['Gas constant R', 'Faraday constant F', 'Equilibrium constant K'] }
      ];
      const cg = colligative[counter % colligative.length];
      return makeQ({
        id: qId, board, grade, subjectId: 'chemistry', levelNode: node,
        text: `In solutions physical chemistry studied in ${city}, which colligative property or parameter is ${cg.use}?`,
        correctOpt: cg.prop,
        wrongOpts: cg.w,
        explanation: `${cg.prop} is utilized because it: ${cg.use}.`,
        hint: 'Biomolecules use osmotic pressure; Antifreeze uses freezing point depression.',
        topicTag: 'Solutions: Colligative Properties'
      });
    }
    case 7: {
      const kinetics = [
        { order: 'First-Order Reaction', halfLife: 'half-life t_1/2 = 0.693 / k is completely independent of initial reactant concentration', w: ['Zero-Order Reaction', 'Second-Order Reaction', 'Third-Order Reaction'] },
        { order: 'Zero-Order Reaction', halfLife: 'rate of reaction is independent of reactant concentration; rate = k[A]⁰ = k', w: ['First-Order Reaction', 'Second-Order Reaction', 'Fractional-Order Reaction'] },
        { order: 'Arrhenius Equation: k = A·e^(-Ea/RT)', halfLife: 'quantifies the temperature dependence of reaction rate constants and activation energy Ea', w: ['Nernst equation', 'Raoult\'s law', 'Beer-Lambert law'] }
      ];
      const kn = kinetics[counter % kinetics.length];
      return makeQ({
        id: qId, board, grade, subjectId: 'chemistry', levelNode: node,
        text: `In chemical kinetics studied by ${name2} in ${city}, which kinetic condition applies where ${kn.halfLife}?`,
        correctOpt: kn.order,
        wrongOpts: kn.w,
        explanation: `In chemical kinetics, ${kn.order} is characterized by: ${kn.halfLife}.`,
        hint: 'First-order half-life is independent of [A]0.',
        topicTag: 'Chemical Kinetics: Rate Laws'
      });
    }
    case 8: {
      const organicNamed = [
        { name: 'Aldol Condensation', cond: 'aldehydes or ketones possessing at least one α-hydrogen atom in presence of dilute NaOH forming β-hydroxy aldehydes', w: ['Cannizzaro Reaction', 'Clemmensen Reduction', 'Wolff-Kishner Reduction'] },
        { name: 'Cannizzaro Reaction', cond: 'self-oxidation and reduction of aldehydes having NO α-hydrogen atoms (like HCHO or Benzaldehyde) in concentrated KOH', w: ['Aldol Condensation', 'Reimer-Tiemann Reaction', 'Kolbe Reaction'] },
        { name: 'Reimer-Tiemann Reaction', cond: 'treatment of phenol with chloroform (CHCl₃) and aqueous NaOH yielding salicylaldehyde (-CHO ortho to -OH)', w: ['Kolbe Reaction', 'Friedel-Crafts Acylation', 'Rosenmund Reduction'] },
        { name: 'Gabriel Phthalimide Synthesis', cond: 'convenient chemical method for preparing pure primary aliphatic amines without secondary or tertiary contamination', w: ['Hoffmann Bromamide Degradation', 'Carbylamine Test', 'Sandmeyer Reaction'] }
      ];
      const on = organicNamed[counter % organicNamed.length];
      return makeQ({
        id: qId, board, grade, subjectId: 'chemistry', levelNode: node,
        text: `In synthetic organic chemistry practiced in ${city}, which prestigious named reaction involves: "${on.cond}"?`,
        correctOpt: on.name,
        wrongOpts: on.w,
        explanation: `The ${on.name} involves: ${on.cond}.`,
        hint: 'Aldol requires α-H; Cannizzaro occurs without α-H.',
        topicTag: 'Organic Chemistry: Named Reactions'
      });
    }
    case 9: {
      const geneticsDNA = [
        { concept: 'Semi-Conservative DNA Replication', exp: 'proven by Matthew Meselson and Franklin Stahl in 1958 using heavy isotope ¹⁵N in E. coli', w: ['Hershey-Chase Experiment', 'Griffith Transformation', 'Avery-MacLeod-McCarty'] },
        { concept: 'Universal Genetic Start Codon', exp: 'AUG which codes for the amino acid Methionine (Met) initiating translation on ribosomes', w: ['UAA stop codon', 'UGA opal codon', 'UAG amber codon'] },
        { concept: 'Lac Operon in E. coli', exp: 'inducible operon regulated by lactose; lacZ encodes β-galactosidase enzyme to cleave lactose into glucose and galactose', w: ['Tryptophan operon', 'Arabinose operon', 'Histidine operon'] }
      ];
      const gd = geneticsDNA[counter % geneticsDNA.length];
      return makeQ({
        id: qId, board, grade, subjectId: 'biology', levelNode: node,
        text: `In molecular genetics studied by ${name1} in ${city}, which discovery represents: "${gd.exp}"?`,
        correctOpt: gd.concept,
        wrongOpts: gd.w,
        explanation: `${gd.concept} corresponds to: ${gd.exp}.`,
        hint: 'Meselson-Stahl proved semi-conservative replication; AUG is start codon.',
        topicTag: 'Molecular Basis of Inheritance'
      });
    }
    case 10: {
      const biotech = [
        { tool: 'EcoRI Restriction Endonuclease', role: 'molecular scissors that cut double-stranded DNA at palindromic sequence 5\'-GAATTC-3\' producing sticky ends', w: ['DNA Ligase', 'Taq Polymerase', 'Reverse Transcriptase'] },
        { tool: 'Taq DNA Polymerase', role: 'thermostable polymerase isolated from Thermus aquaticus used in automated PCR thermocycling (up to 95°C)', w: ['RNA Polymerase II', 'EcoRI endonuclease', 'DNA Helicase'] },
        { tool: 'Bt Toxin (Cry proteins)', role: 'endotoxin crystals from Bacillus thuringiensis that dissolve in alkaline insect midgut creating fatal perforating pores', w: ['Synthetic pyrethroid', 'Antibiotic penicillin', 'Cytokinin'] }
      ];
      const bt = biotech[counter % biotech.length];
      return makeQ({
        id: qId, board, grade, subjectId: 'biology', levelNode: node,
        text: `In recombinant DNA biotechnology examined in ${city}, which molecular tool or agent ${bt.role}?`,
        correctOpt: bt.tool,
        wrongOpts: bt.w,
        explanation: `${bt.tool} is ${bt.role}.`,
        hint: 'Restriction enzymes cut DNA; Taq polymerase resists heat in PCR.',
        topicTag: 'Biotechnology: Principles and Applications'
      });
    }
    case 11: {
      const photoelectric = [
        { law: 'Einstein\'s Photoelectric Equation', form: 'hν = Φ₀ + K_max, where incident photon energy equals work function plus maximum photoelectron kinetic energy', w: ['de Broglie matter wave', 'Bohr angular momentum', 'Planck blackbody law'] },
        { law: 'Work Function (Φ₀)', form: 'the minimum photon energy required to liberate an electron from the metal surface without kinetic energy (Φ₀ = hν₀)', w: ['Threshold wavelength', 'Stopping potential', 'Compton wavelength'] }
      ];
      const pe = photoelectric[counter % photoelectric.length];
      return makeQ({
        id: qId, board, grade, subjectId: 'physics', levelNode: node,
        text: `In modern quantum physics investigated by ${name2} in ${city}, which concept is formulated as: "${pe.form}"?`,
        correctOpt: pe.law,
        wrongOpts: pe.w,
        explanation: `${pe.law} is stated as: ${pe.form}.`,
        hint: 'Einstein received the 1921 Nobel Prize for explaining the photoelectric effect.',
        topicTag: 'Dual Nature of Radiation: Photoelectric Effect'
      });
    }
    case 12: {
      const semiconductors = [
        { device: 'Zener Diode', func: 'heavily doped p-n junction operating in reverse breakdown region utilized as a precise DC VOLTAGE REGULATOR', w: ['Photodiode', 'Light Emitting Diode', 'Solar Cell'] },
        { device: 'Light Emitting Diode (LED)', func: 'forward-biased p-n junction diode that spontaneously emits photons of light during electron-hole recombination', w: ['Zener Diode', 'Photodiode', 'Varactor Diode'] },
        { device: 'Photodiode', func: 'reverse-biased junction diode used to detect optical signals based on photon absorption generating reverse saturation current', w: ['Zener Diode', 'LED', 'Tunnel Diode'] }
      ];
      const sc12 = semiconductors[counter % semiconductors.length];
      return makeQ({
        id: qId, board, grade, subjectId: 'physics', levelNode: node,
        text: `In semiconductor solid-state electronics tested in ${city}, which junction diode device ${sc12.func}?`,
        correctOpt: sc12.device,
        wrongOpts: sc12.w,
        explanation: `A ${sc12.device} is designed such that it: ${sc12.func}.`,
        hint: 'Zener diode regulates voltage in reverse breakdown.',
        topicTag: 'Semiconductor Electronics'
      });
    }
    case 13: {
      const coordChemistry = [
        { cpd: '[Co(NH₃)₆]Cl₃', name: 'Hexaamminecobalt(III) chloride', coNum: 'coordination number 6 with octahedral geometry', w: ['Hexaamminecobalt(II) chloride', 'Triamminecobalt(III) chloride', 'Cobalt hexachloride'] },
        { cpd: 'K₄[Fe(CN)₆]', name: 'Potassium hexacyanoferrate(II)', coNum: 'diamagnetic low-spin complex with zero unpaired electrons (t2g⁶ eg⁰)', w: ['Potassium hexacyanoferrate(III)', 'Potassium iron cyanide', 'Iron hexacyanide'] }
      ];
      const cc = coordChemistry[counter % coordChemistry.length];
      return makeQ({
        id: qId, board, grade, subjectId: 'chemistry', levelNode: node,
        text: `According to IUPAC coordination chemistry rules, what is the systematic name of the coordination compound ${cc.cpd} (${cc.coNum}) evaluated by ${name1} in ${city}?`,
        correctOpt: cc.name,
        wrongOpts: cc.w,
        explanation: `${cc.cpd} is IUPAC named as: ${cc.name}.`,
        hint: 'Cation named first; ligands in alphabetical order followed by central metal and oxidation state in Roman numerals.',
        topicTag: 'Coordination Compounds: IUPAC Nomenclature'
      });
    }
    case 14: {
      const ecologyLaw = [
        { law: 'Lindeman\'s 10% Energy Transfer Law', state: 'only approximately 10% of chemical energy is transferred from one trophic level to the next, with 90% lost as metabolic heat', w: ['Liebig\'s Law of the Minimum', 'Shelford\'s Law of Tolerance', 'Gause\'s Competitive Exclusion'] },
        { law: 'Gause\'s Competitive Exclusion Principle', state: 'two closely related species competing for the exact same limiting resource cannot coexist indefinitely in the same ecological niche', w: ['10% Energy Law', 'Hardy-Weinberg Principle', 'Allen\'s Rule'] }
      ];
      const el = ecologyLaw[counter % ecologyLaw.length];
      return makeQ({
        id: qId, board, grade, subjectId: 'biology', levelNode: node,
        text: `In ecological population biology studied in ${city}, which fundamental principle states that: "${el.state}"?`,
        correctOpt: el.law,
        wrongOpts: el.w,
        explanation: `The ${el.law} establishes that: ${el.state}.`,
        hint: '10% energy moves up each trophic level.',
        topicTag: 'Ecosystem and Energy Flow'
      });
    }
    case 15: {
      const pB = 0.5;
      const pIntersect = 0.3; // independent: 0.6 * 0.5 = 0.3
      const pCond = (pIntersect / pB).toFixed(2);
      return makeQ({
        id: qId, board, grade, subjectId: 'math', levelNode: node,
        text: `In probability theory calculated by ${name2} in ${city}, if P(A) = 0.6, P(B) = 0.5, and P(A ∩ B) = 0.3, find the CONDITIONAL PROBABILITY P(A|B) using P(A|B) = P(A ∩ B) / P(B).`,
        correctOpt: `${pCond}`,
        wrongOpts: [`${(parseFloat(pCond) + 0.15).toFixed(2)}`, `${(parseFloat(pCond) - 0.15).toFixed(2)}`, '0.18'],
        explanation: `Conditional probability P(A|B) = P(A ∩ B) / P(B) = 0.3 / 0.5 = 0.60.`,
        hint: 'Formula: P(A|B) = P(A ∩ B) / P(B).',
        topicTag: 'Probability: Conditional Probability'
      });
    }
    case 16: {
      const halfLifeDays = ((counter % 25) + 2) * 5; // 10 to 130 days
      const decayConstant = (0.693 / halfLifeDays).toFixed(4);
      return makeQ({
        id: qId, board, grade, subjectId: 'physics', levelNode: node,
        text: `A radioactive medical isotope stored in a clinic in ${city} has a half-life T_½ = ${halfLifeDays} days. What is its RADIOACTIVE DECAY CONSTANT λ = 0.693 / T_½?`,
        correctOpt: `${decayConstant} day⁻¹`,
        wrongOpts: [`${(parseFloat(decayConstant) + 0.01).toFixed(4)} day⁻¹`, `${(parseFloat(decayConstant) - 0.01).toFixed(4)} day⁻¹`, `${(halfLifeDays * 0.693).toFixed(2)} day⁻¹`],
        explanation: `Decay constant λ = ln 2 / T_½ = 0.693 / ${halfLifeDays} = ${decayConstant} per day.`,
        hint: 'Formula: λ = 0.693 / T_½.',
        topicTag: 'Nuclear Physics: Radioactive Decay'
      });
    }
    case 17: {
      const organicMech = [
        { mech: 'SN1 Mechanism (Substitution Nucleophilic Unimolecular)', feat: 'two-step reaction via planar carbocation intermediate resulting in partial RACEMIZATION of configuration', w: ['SN2 Mechanism (Walden Inversion)', 'E2 Elimination', 'Electrophilic Addition'] },
        { mech: 'SN2 Mechanism (Substitution Nucleophilic Bimolecular)', feat: 'concerted one-step reaction involving backside nucleophilic attack causing 100% WALDEN INVERSION of configuration', w: ['SN1 Mechanism', 'E1 Elimination', 'Free radical substitution'] }
      ];
      const om = organicMech[counter % organicMech.length];
      return makeQ({
        id: qId, board, grade, subjectId: 'chemistry', levelNode: node,
        text: `In stereochemical haloalkane substitution mechanisms studied by ${name1} in ${city}, which mechanism proceeds via: "${om.feat}"?`,
        correctOpt: om.mech,
        wrongOpts: om.w,
        explanation: `${om.mech} is characterized by: ${om.feat}.`,
        hint: 'SN1 leads to racemization; SN2 leads to complete inversion of configuration.',
        topicTag: 'Haloalkanes: SN1 and SN2 Mechanisms'
      });
    }
    case 18: {
      const aVec = (counter % 12) + 1;
      const bVec = (counter % 10) + 2;
      const cVec = (counter % 8) + 1;
      const magVec = Math.sqrt(aVec * aVec + bVec * bVec + cVec * cVec).toFixed(2);
      return makeQ({
        id: qId, board, grade, subjectId: 'math', levelNode: node,
        text: `Calculate the MAGNITUDE of vector v = ${aVec}î + ${bVec}ĵ + ${cVec}k̂ in 3D Euclidean space in ${city} using |v| = √(a² + b² + c²).`,
        correctOpt: `${magVec} units`,
        wrongOpts: [`${(parseFloat(magVec) + 1).toFixed(2)} units`, `${(parseFloat(magVec) - 1).toFixed(2)} units`, `${aVec + bVec + cVec} units`],
        explanation: `Magnitude |v| = √(${aVec}² + ${bVec}² + ${cVec}²) = √(${aVec * aVec + bVec * bVec + cVec * cVec}) ≈ ${magVec} units.`,
        hint: 'Formula: |v| = √(x² + y² + z²).',
        topicTag: 'Vector Algebra: Vector Magnitude'
      });
    }
    default: {
      const reproductiveHealth = [
        { tech: 'In Vitro Fertilization (IVF)', desc: 'fertilization of ovum by sperm outside the female body in a culture dish followed by embryo transfer (ET)', w: ['Artificial Insemination (AI)', 'Tubectomy', 'Vasectomy'] },
        { tech: 'Intra-Cytoplasmic Sperm Injection (ICSI)', desc: 'specialized laboratory procedure where a single healthy sperm is directly microinjected into the cytoplasm of an ovum', w: ['GIFT (Gamete Intra-Fallopian Transfer)', 'ZIFT', 'Barrier contraception'] }
      ];
      const rh = reproductiveHealth[counter % reproductiveHealth.length];
      return makeQ({
        id: qId, board, grade, subjectId: 'biology', levelNode: node,
        text: `In modern reproductive medical technologies (ART) reviewed in ${city}, which procedure involves: "${rh.desc}"?`,
        correctOpt: rh.tech,
        wrongOpts: rh.w,
        explanation: `${rh.tech} is defined as: ${rh.desc}.`,
        hint: 'IVF is test-tube fertilization; ICSI is direct sperm microinjection.',
        topicTag: 'Reproductive Health: Assisted Reproductive Technologies'
      });
    }
  }
}
