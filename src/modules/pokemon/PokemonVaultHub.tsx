import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  PokeApiService,
  PokemonDetail,
  PokemonListItem,
  ICONIC_POKEMON_ROSTER,
  TYPE_COLORS,
  TYPE_CHART,
  getTypeMultiplier,
  PokemonMove
} from '../../services/pokeApiService';
import { Learner } from '../../core/types';
import { CoinLedgerService } from '../../services/coinLedgerService';
import { StudyCoinIcon } from '../shared/StudyCoinIcon';
import {
  Volume2,
  Sparkles,
  Search,
  Swords,
  HelpCircle,
  BookOpen,
  ArrowLeft,
  RefreshCw,
  Trophy,
  Flame,
  Shield,
  Zap,
  CheckCircle2,
  AlertCircle,
  Eye,
  Info,
  Coins
} from 'lucide-react';

export interface PokemonVaultHubProps {
  onBackToApp: () => void;
  learner?: Learner | null;
  onRefreshLearner?: () => void;
  onOpenAuth?: (mode: 'LOGIN' | 'REGISTER') => void;
}

type VaultTab = 'pokedex' | 'whos_that' | 'battle' | 'type_master';

export const PokemonVaultHub: React.FC<PokemonVaultHubProps> = ({
  onBackToApp,
  learner,
  onRefreshLearner,
  onOpenAuth
}) => {
  const [activeTab, setActiveTab] = useState<VaultTab>('pokedex');

  // ==========================================
  // POKÉDEX STATE
  // ==========================================
  const [pokemonList, setPokemonList] = useState<PokemonListItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonDetail | null>(ICONIC_POKEMON_ROSTER[0]);
  const [isShiny, setIsShiny] = useState(false);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // ==========================================
  // "WHO'S THAT POKÉMON?" GAME STATE
  // ==========================================
  const [quizPokemon, setQuizPokemon] = useState<PokemonDetail>(ICONIC_POKEMON_ROSTER[0]);
  const [quizOptions, setQuizOptions] = useState<string[]>([]);
  const [hasGuessed, setHasGuessed] = useState(false);
  const [isCorrectGuess, setIsCorrectGuess] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState<number>(() => {
    return Number(localStorage.getItem('al_poke_best_streak') || 0);
  });
  const [coinsAwardedThisSession, setCoinsAwardedThisSession] = useState(0);
  const [coinAwardNotice, setCoinAwardNotice] = useState<{
    amount: number;
    message: string;
    balance?: number;
  } | null>(null);

  // ==========================================
  // BATTLE ARENA STATE
  // ==========================================
  const [playerPokemon, setPlayerPokemon] = useState<PokemonDetail>(ICONIC_POKEMON_ROSTER[0]); // Pikachu
  const [enemyPokemon, setEnemyPokemon] = useState<PokemonDetail>(ICONIC_POKEMON_ROSTER[1]); // Charizard
  const [playerHp, setPlayerHp] = useState(100);
  const [enemyHp, setEnemyHp] = useState(100);
  const [playerMaxHp, setPlayerMaxHp] = useState(100);
  const [enemyMaxHp, setEnemyMaxHp] = useState(100);
  const [battleLog, setBattleLog] = useState<string[]>(['The battle has begun! Choose your move.']);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [battleStatus, setBattleStatus] = useState<'ongoing' | 'victory' | 'defeat'>('ongoing');
  const [isAttacking, setIsAttacking] = useState<'player' | 'enemy' | null>(null);
  const [battleWins, setBattleWins] = useState(0);

  // ==========================================
  // TYPE MASTER QUIZ STATE
  // ==========================================
  const [typeQuestionIndex, setTypeQuestionIndex] = useState(0);
  const [typeScore, setTypeScore] = useState(0);
  const [typeAnswered, setTypeAnswered] = useState<string | null>(null);

  // Load initial Pokemon list (top 151 / Generation 1 by default with pagination)
  useEffect(() => {
    const fetchList = async () => {
      setIsLoadingList(true);
      try {
        const list = await PokeApiService.getPokemonList(151, 0);
        setPokemonList(list);
      } catch {
        // Fallback
        setPokemonList(ICONIC_POKEMON_ROSTER.map(p => ({ name: p.name, url: '', id: p.id })));
      } finally {
        setIsLoadingList(false);
      }
    };
    fetchList();
  }, []);

  // Fetch full details when selected pokemon changes
  const handleSelectPokemon = async (idOrName: string | number) => {
    setIsLoadingDetail(true);
    try {
      const detail = await PokeApiService.getPokemon(idOrName);
      setSelectedPokemon(detail);
      PokeApiService.playCry(detail.id);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Filtered Pokémon list
  const filteredList = useMemo(() => {
    return pokemonList.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            String(p.id).includes(searchQuery);
      return matchesSearch;
    });
  }, [pokemonList, searchQuery]);

  // ==========================================
  // WHO'S THAT POKEMON GENERATOR
  // ==========================================
  const setupNewGuessRound = async () => {
    setHasGuessed(false);
    setIsCorrectGuess(false);
    setSelectedOption(null);
    setCoinAwardNotice(null);

    // Pick 1 target and 3 random distractors from iconic roster or full list
    const pool = ICONIC_POKEMON_ROSTER;
    const target = pool[Math.floor(Math.random() * pool.length)];
    const distractors = pool.filter(p => p.id !== target.id).sort(() => 0.5 - Math.random()).slice(0, 3);
    const options = [target.name, ...distractors.map(d => d.name)].sort(() => 0.5 - Math.random());

    setQuizPokemon(target);
    setQuizOptions(options);
  };

  useEffect(() => {
    if (activeTab === 'whos_that' && !hasGuessed && quizOptions.length === 0) {
      setupNewGuessRound();
    }
  }, [activeTab]);

  const handleGuess = (guessedName: string) => {
    if (hasGuessed) return;
    setHasGuessed(true);
    setSelectedOption(guessedName);

    const correct = guessedName.toLowerCase() === quizPokemon.name.toLowerCase();
    setIsCorrectGuess(correct);

    if (correct) {
      PokeApiService.playCry(quizPokemon.id);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > bestStreak) {
        setBestStreak(newStreak);
        localStorage.setItem('al_poke_best_streak', String(newStreak));
      }

      setCoinsAwardedThisSession(prev => prev + 1);

      // Award strictly 1 coin for truly correct pokemon guess
      if (learner?.id) {
        try {
          const res = CoinLedgerService.appendTransaction(
            learner.id,
            1,
            'POKEMON_GUESS_REWARD',
            {
              pokemonId: quizPokemon.id,
              pokemonName: quizPokemon.name,
              streak: newStreak,
              game: 'WHOS_THAT_POKEMON'
            }
          );
          if (res.success) {
            setCoinAwardNotice({
              amount: 1,
              message: '+1 Study Coin Awarded! 🪙 Added to your balance',
              balance: res.newBalance
            });
            onRefreshLearner?.();
          } else {
            setCoinAwardNotice({
              amount: 1,
              message: '+1 PokéCoin earned!'
            });
          }
        } catch (err) {
          console.error('Error awarding coin for pokemon guess:', err);
          setCoinAwardNotice({
            amount: 1,
            message: '+1 PokéCoin earned!'
          });
        }
      } else {
        setCoinAwardNotice({
          amount: 1,
          message: '+1 PokéCoin earned! 🪙 Sign in to save coins to your AcademicLevel balance'
        });
      }
    } else {
      setStreak(0);
      setCoinAwardNotice(null);
    }
  };

  // ==========================================
  // BATTLE ARENA LOGIC
  // ==========================================
  const startNewBattle = (pPokemon: PokemonDetail, ePokemon?: PokemonDetail) => {
    const opp = ePokemon || ICONIC_POKEMON_ROSTER.filter(p => p.id !== pPokemon.id)[Math.floor(Math.random() * (ICONIC_POKEMON_ROSTER.length - 1))];
    setPlayerPokemon(pPokemon);
    setEnemyPokemon(opp);

    const pMax = 120 + (pPokemon.stats.find(s => s.name === 'hp')?.baseStat || 70);
    const eMax = 120 + (opp.stats.find(s => s.name === 'hp')?.baseStat || 70);
    setPlayerMaxHp(pMax);
    setEnemyMaxHp(eMax);
    setPlayerHp(pMax);
    setEnemyHp(eMax);

    setBattleLog([
      `⚔️ Wild ${opp.name.toUpperCase()} appeared!`,
      `Go, ${pPokemon.name.toUpperCase()}! What will you do?`
    ]);
    setIsPlayerTurn(true);
    setBattleStatus('ongoing');
    PokeApiService.playCry(pPokemon.id);
  };

  useEffect(() => {
    if (activeTab === 'battle' && battleStatus === 'ongoing' && playerHp === 100) {
      startNewBattle(ICONIC_POKEMON_ROSTER[0], ICONIC_POKEMON_ROSTER[1]);
    }
  }, [activeTab]);

  const playerMoves = useMemo(() => {
    return PokeApiService.getMovesForPokemon(playerPokemon.name);
  }, [playerPokemon]);

  const enemyMoves = useMemo(() => {
    return PokeApiService.getMovesForPokemon(enemyPokemon.name);
  }, [enemyPokemon]);

  const executeMove = (move: PokemonMove) => {
    if (!isPlayerTurn || battleStatus !== 'ongoing') return;

    setIsPlayerTurn(false);
    setIsAttacking('player');

    // Calculate player damage
    const pAtk = playerPokemon.stats.find(s => s.name === (move.damageClass === 'special' ? 'special-attack' : 'attack'))?.baseStat || 80;
    const eDef = enemyPokemon.stats.find(s => s.name === (move.damageClass === 'special' ? 'special-defense' : 'defense'))?.baseStat || 75;
    const mult = getTypeMultiplier(move.type, enemyPokemon.types);
    const crit = Math.random() < 0.12 ? 1.5 : 1.0;

    const baseDmg = Math.floor(((((2 * 50) / 5 + 2) * move.power * (pAtk / eDef)) / 50 + 2) * mult * crit * (0.85 + Math.random() * 0.15));
    const finalDamage = Math.max(12, baseDmg);

    setTimeout(() => {
      setIsAttacking(null);
      const nextEnemyHp = Math.max(0, enemyHp - finalDamage);
      setEnemyHp(nextEnemyHp);

      let effectivenessNotice = '';
      if (mult >= 2) effectivenessNotice = " 🔥 It's super effective!";
      else if (mult === 0) effectivenessNotice = " 🛡️ It had no effect!";
      else if (mult < 1) effectivenessNotice = " 🍃 It's not very effective...";
      if (crit > 1) effectivenessNotice += ' ⚡ Critical hit!';

      const logMsg = `${playerPokemon.name.toUpperCase()} used ${move.name}! Dealt ${finalDamage} damage.${effectivenessNotice}`;
      setBattleLog(prev => [logMsg, ...prev.slice(0, 4)]);

      if (nextEnemyHp <= 0) {
        setBattleStatus('victory');
        setBattleWins(w => w + 1);
        setBattleLog(prev => [`🏆 Enemy ${enemyPokemon.name.toUpperCase()} fainted! You won the battle!`, ...prev]);
        return;
      }

      // Enemy Counter Attack after 1.2s
      setTimeout(() => {
        setIsAttacking('enemy');
        const aiMove = enemyMoves[Math.floor(Math.random() * enemyMoves.length)];
        const eAtk = enemyPokemon.stats.find(s => s.name === (aiMove.damageClass === 'special' ? 'special-attack' : 'attack'))?.baseStat || 80;
        const pDef = playerPokemon.stats.find(s => s.name === (aiMove.damageClass === 'special' ? 'special-defense' : 'defense'))?.baseStat || 75;
        const eMult = getTypeMultiplier(aiMove.type, playerPokemon.types);
        const eCrit = Math.random() < 0.1 ? 1.5 : 1.0;

        const eBaseDmg = Math.floor(((((2 * 50) / 5 + 2) * aiMove.power * (eAtk / pDef)) / 50 + 2) * eMult * eCrit * (0.85 + Math.random() * 0.15));
        const finalEnemyDamage = Math.max(10, eBaseDmg);

        setTimeout(() => {
          setIsAttacking(null);
          const nextPlayerHp = Math.max(0, playerHp - finalEnemyDamage);
          setPlayerHp(nextPlayerHp);

          let eNotice = '';
          if (eMult >= 2) eNotice = " 🔥 Super effective!";
          else if (eMult === 0) eNotice = " 🛡️ No effect!";
          else if (eMult < 1) eNotice = " 🍃 Not very effective...";

          const aiLog = `Enemy ${enemyPokemon.name.toUpperCase()} used ${aiMove.name}! Dealt ${finalEnemyDamage} damage.${eNotice}`;
          setBattleLog(prev => [aiLog, ...prev.slice(0, 4)]);

          if (nextPlayerHp <= 0) {
            setBattleStatus('defeat');
            setBattleLog(prev => [`💀 ${playerPokemon.name.toUpperCase()} fainted! You whited out...`, ...prev]);
          } else {
            setIsPlayerTurn(true);
          }
        }, 500);
      }, 900);
    }, 500);
  };

  // ==========================================
  // TYPE MASTER QUIZ QUESTIONS
  // ==========================================
  const TYPE_QUESTIONS = [
    {
      q: 'Which type is SUPER EFFECTIVE against Water-type Pokémon?',
      options: ['Electric', 'Fire', 'Steel', 'Ice'],
      answer: 'Electric',
      explanation: 'Electric and Grass attacks inflict 2x super effective damage against Water!'
    },
    {
      q: 'Ghost-type attacks deal ZERO damage (Immune) against which type?',
      options: ['Normal', 'Psychic', 'Dark', 'Fairy'],
      answer: 'Normal',
      explanation: 'Normal-type Pokémon are completely immune to Ghost attacks (and vice-versa)!'
    },
    {
      q: 'Charizard is Fire/Flying. Which type inflicts 4x QUADRUPLE damage against it?',
      options: ['Rock', 'Water', 'Electric', 'Ground'],
      answer: 'Rock',
      explanation: 'Both Fire and Flying are weak to Rock, resulting in a devastating 4x damage multiplier!'
    },
    {
      q: 'Which type is immune to Dragon-type attacks?',
      options: ['Fairy', 'Steel', 'Ice', 'Ghost'],
      answer: 'Fairy',
      explanation: 'Fairy-type was introduced in Gen VI to bring balance, possessing total immunity to Dragon!'
    },
    {
      q: 'Ground-type moves have ZERO effect on which type?',
      options: ['Flying', 'Grass', 'Bug', 'Steel'],
      answer: 'Flying',
      explanation: 'Flying Pokémon hover above the ground, making earthquakes and ground attacks completely miss!'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-red-500 selection:text-white pb-16">
      {/* ======================================================== */}
      {/* RETRO POKÉDEX HEADER SHELL                               */}
      {/* ======================================================== */}
      <header className="bg-gradient-to-r from-red-700 via-red-600 to-rose-700 border-b-4 border-red-900 shadow-2xl relative sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          {/* Authentic Pokédex Sensor Lights */}
          <div className="flex items-center space-x-3">
            {/* Big Blue Pulsing Sensor Lens */}
            <div className="relative">
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-cyan-600 via-sky-400 to-white p-1 border-4 border-white shadow-[0_0_20px_rgba(56,189,248,0.8)] flex items-center justify-center animate-pulse">
                <div className="w-4 h-4 rounded-full bg-cyan-200/80 -translate-x-1 -translate-y-1" />
              </div>
            </div>

            {/* Tri-Color Mini Status LEDs */}
            <div className="flex items-center space-x-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-red-400 border border-red-200 shadow-[0_0_8px_rgba(248,113,113,0.8)]" />
              <span className="w-3.5 h-3.5 rounded-full bg-amber-300 border border-amber-100 shadow-[0_0_8px_rgba(252,211,77,0.8)]" />
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 border border-emerald-100 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            </div>

            <div className="pl-2">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black tracking-widest uppercase bg-black/40 px-2 py-0.5 rounded text-amber-300 border border-amber-300/30 font-mono">
                  SECRET /PIKA VAULT
                </span>
                <span className="text-[10px] bg-red-900/80 text-white font-mono px-1.5 py-0.5 rounded border border-red-400/40">
                  PokeAPI v2
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center space-x-1.5 drop-shadow">
                <span>AcademicLevel Pokédex &amp; Arcade</span>
              </h1>
            </div>
          </div>

          {/* Navigation Bar & Live Balance / Return Button */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {learner ? (
              <div
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-black/40 border border-amber-400/40 rounded-xl text-xs font-mono font-bold text-amber-300 shadow-sm"
                title="Your AcademicLevel Study Coin Balance"
              >
                <StudyCoinIcon className="w-4 h-4" glow />
                <span>{learner.coinBalance ?? 0} Coins</span>
              </div>
            ) : (
              onOpenAuth && (
                <button
                  onClick={() => onOpenAuth('LOGIN')}
                  className="px-2.5 py-1.5 bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 font-bold text-xs rounded-xl border border-amber-400/30 transition-all flex items-center space-x-1.5 cursor-pointer"
                  title="Sign In to Save PokéCoins to your AcademicLevel Account"
                >
                  <StudyCoinIcon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign In to Save Coins</span>
                  <span className="sm:hidden">Sign In</span>
                </button>
              )
            )}

            <button
              onClick={onBackToApp}
              className="px-3 py-1.5 bg-black/50 hover:bg-black/80 text-white font-bold text-xs rounded-xl border border-white/20 shadow transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to AcademicLevel</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="bg-red-900/60 backdrop-blur-md px-4 border-t border-red-500/30">
          <div className="max-w-7xl mx-auto flex items-center space-x-2 py-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('pokedex')}
              className={`px-3.5 py-1.5 rounded-xl font-black text-xs transition-all flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'pokedex'
                  ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/30'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Pokédex Explorer</span>
            </button>

            <button
              onClick={() => setActiveTab('whos_that')}
              className={`px-3.5 py-1.5 rounded-xl font-black text-xs transition-all flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'whos_that'
                  ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/30'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Who&apos;s That Pokémon?</span>
            </button>

            <button
              onClick={() => setActiveTab('battle')}
              className={`px-3.5 py-1.5 rounded-xl font-black text-xs transition-all flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'battle'
                  ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/30'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Swords className="w-3.5 h-3.5" />
              <span>Battle Arena</span>
            </button>

            <button
              onClick={() => setActiveTab('type_master')}
              className={`px-3.5 py-1.5 rounded-xl font-black text-xs transition-all flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'type_master'
                  ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/30'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Type Matchup Master</span>
            </button>
          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* MAIN CONTENT AREA BY TAB                                 */}
      {/* ======================================================== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full">
        {/* ==================================================== */}
        {/* TAB 1: POKÉDEX EXPLORER                              */}
        {/* ==================================================== */}
        {activeTab === 'pokedex' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Col: Roster Grid & Search Filter (7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Search Bar */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by name or number (e.g. pikachu, charizard, 25)..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Quick Iconic Pokémon Shortcuts */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  🌟 Quick Select Iconic Pokémon
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {ICONIC_POKEMON_ROSTER.map(p => (
                    <button
                      key={p.id}
                      onClick={() => handleSelectPokemon(p.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                        selectedPokemon?.id === p.id
                          ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                      }`}
                    >
                      <span className="capitalize">{p.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">#{p.id}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Pokémon Grid */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl">
                <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
                  <span>Found <strong>{filteredList.length}</strong> Pokémon entries</span>
                  <span className="font-mono text-[10px] text-amber-400">PokeAPI v2 Live Feed</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-[560px] overflow-y-auto pr-1">
                  {filteredList.map(p => {
                    const isCurrent = selectedPokemon?.id === p.id;
                    const sprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`;
                    return (
                      <button
                        key={p.id}
                        onClick={() => handleSelectPokemon(p.id)}
                        className={`p-2.5 rounded-2xl border text-left transition-all flex flex-col items-center justify-between group cursor-pointer relative ${
                          isCurrent
                            ? 'bg-red-950/40 border-red-500 shadow-lg shadow-red-500/20'
                            : 'bg-slate-950/80 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <span className="self-end text-[10px] font-mono font-bold text-slate-500">
                          #{String(p.id).padStart(3, '0')}
                        </span>
                        <img
                          src={sprite}
                          alt={p.name}
                          loading="lazy"
                          className="w-16 h-16 object-contain group-hover:scale-110 transition-transform"
                          onError={(e: any) => {
                            e.target.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png';
                          }}
                        />
                        <span className="text-xs font-bold text-white capitalize mt-1 text-center truncate w-full">
                          {p.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Col: High-Definition Pokédex Screen & Lore (5 Cols) */}
            <div className="lg:col-span-5">
              {selectedPokemon ? (
                <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-red-600/70 rounded-3xl p-6 shadow-2xl space-y-5 sticky top-24">
                  {/* Screen Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-black text-amber-400">
                          #{String(selectedPokemon.id).padStart(3, '0')}
                        </span>
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                          {selectedPokemon.generation || 'GEN I'}
                        </span>
                      </div>
                      <h2 className="text-2xl font-black text-white capitalize tracking-tight mt-0.5">
                        {selectedPokemon.name}
                      </h2>
                      <span className="text-xs text-slate-400 italic">
                        {selectedPokemon.genus || 'Curriculum Pokémon'}
                      </span>
                    </div>

                    {/* Audio Cry Button & Shiny Toggle */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => PokeApiService.playCry(selectedPokemon.id)}
                        className="p-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl shadow-lg shadow-red-600/30 transition-all cursor-pointer"
                        title="Play Pokémon Cry"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setIsShiny(!isShiny)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                          isShiny
                            ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-lg shadow-amber-400/40'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                        }`}
                        title="Toggle Shiny Artwork"
                      >
                        <Sparkles className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Artwork Showcase Display */}
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center relative group shadow-inner">
                    <img
                      src={isShiny ? selectedPokemon.shinyArtworkUrl : selectedPokemon.artworkUrl}
                      alt={selectedPokemon.name}
                      className="w-48 h-48 sm:w-56 sm:h-56 object-contain filter drop-shadow-[0_15px_15px_rgba(0,0,0,0.6)] group-hover:scale-105 transition-all select-none"
                    />

                    {selectedPokemon.animatedSpriteUrl && (
                      <div className="absolute bottom-2 right-2 p-1 bg-black/60 backdrop-blur-sm rounded-lg border border-white/10">
                        <img
                          src={selectedPokemon.animatedSpriteUrl}
                          alt="animated sprite"
                          className="w-10 h-10 object-contain"
                        />
                      </div>
                    )}
                  </div>

                  {/* Type Badges */}
                  <div className="flex items-center gap-2">
                    {selectedPokemon.types.map(t => {
                      const style = TYPE_COLORS[t.toLowerCase()] || TYPE_COLORS.normal;
                      return (
                        <span
                          key={t}
                          className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow border ${style.bg} ${style.text} ${style.border}`}
                        >
                          {t}
                        </span>
                      );
                    })}

                    <span className="text-xs text-slate-400 ml-auto font-mono">
                      HT: {selectedPokemon.height / 10}m • WT: {selectedPokemon.weight / 10}kg
                    </span>
                  </div>

                  {/* Lore / Pokédex Description */}
                  {selectedPokemon.flavorText && (
                    <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-slate-300 leading-relaxed font-sans">
                      <p>&ldquo;{selectedPokemon.flavorText}&rdquo;</p>
                    </div>
                  )}

                  {/* Base Stats Radar / Progress Bars */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">
                      📊 Base Combat Statistics
                    </span>
                    <div className="space-y-1.5 font-mono text-xs">
                      {selectedPokemon.stats.map(s => {
                        const pct = Math.min(100, (s.baseStat / 180) * 100);
                        const isHigh = s.baseStat >= 100;
                        return (
                          <div key={s.name} className="flex items-center space-x-2">
                            <span className="w-20 text-[11px] text-slate-400 uppercase truncate">
                              {s.name.replace('special-', 'Sp. ')}
                            </span>
                            <span className="w-9 font-bold text-right text-white">
                              {s.baseStat}
                            </span>
                            <div className="flex-1 bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  isHigh ? 'bg-amber-400' : 'bg-red-500'
                                }`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Battle with this Pokémon CTA */}
                  <button
                    onClick={() => {
                      startNewBattle(selectedPokemon);
                      setActiveTab('battle');
                    }}
                    className="w-full py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs rounded-xl shadow-lg shadow-red-600/30 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Swords className="w-4 h-4" />
                    <span>BATTLE WITH {selectedPokemon.name.toUpperCase()} IN ARENA</span>
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 2: "WHO'S THAT POKÉMON?" GUESSING GAME           */}
        {/* ==================================================== */}
        {activeTab === 'whos_that' && (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Header Score Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 font-mono">
                    ANIME CLASSIC GAME
                  </span>
                  <h2 className="text-xl font-black text-white">Who&apos;s That Pokémon?!</h2>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Streak</span>
                    <span className="font-mono font-black text-lg text-emerald-400 flex items-center gap-1 justify-end">
                      <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
                      {streak}
                    </span>
                  </div>
                  <div className="text-right border-l border-slate-800 pl-4">
                    <span className="text-[10px] text-slate-400 block">Best Record</span>
                    <span className="font-mono font-black text-lg text-amber-400 flex items-center gap-1 justify-end">
                      <Trophy className="w-4 h-4 text-amber-400" />
                      {bestStreak}
                    </span>
                  </div>
                  <div className="text-right border-l border-slate-800 pl-4">
                    <span className="text-[10px] text-slate-400 block">Earned Today</span>
                    <span className="font-mono font-black text-lg text-amber-300 flex items-center gap-1 justify-end">
                      <StudyCoinIcon className="w-4 h-4" />
                      +{coinsAwardedThisSession}
                    </span>
                  </div>
                </div>
              </div>

              {/* Reward Rules Banner */}
              <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-800/80 text-xs">
                <div className="flex items-center space-x-1.5 text-amber-300 font-semibold">
                  <StudyCoinIcon className="w-3.5 h-3.5" glow />
                  <span>Win <strong>+1 Study Coin</strong> for every correct Pokémon identified!</span>
                </div>
                {learner && (
                  <span className="text-[11px] font-mono text-slate-400">
                    Wallet: <strong className="text-amber-300 font-bold">{learner.coinBalance ?? 0} Coins</strong>
                  </span>
                )}
              </div>
            </div>

            {/* Coin Award Notification Banner */}
            {hasGuessed && isCorrectGuess && coinAwardNotice && (
              <div className="bg-gradient-to-r from-amber-500/20 via-yellow-500/25 to-amber-500/20 border-2 border-amber-400/50 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-amber-100 shadow-xl shadow-amber-500/10 animate-in zoom-in-95 duration-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center flex-shrink-0">
                    <StudyCoinIcon className="w-6 h-6 animate-bounce" glow />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                        Correct Guess Reward
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-amber-400/30 text-[10px] font-mono font-bold text-amber-200 border border-amber-400/40">
                        +1 Coin
                      </span>
                    </div>
                    <p className="text-sm font-black text-white drop-shadow">
                      {coinAwardNotice.message}
                    </p>
                    {coinAwardNotice.balance !== undefined && (
                      <p className="text-[11px] text-amber-300/80 font-mono mt-0.5">
                        New Account Balance: {coinAwardNotice.balance} Coins
                      </p>
                    )}
                  </div>
                </div>
                {!learner && onOpenAuth && (
                  <button
                    onClick={() => onOpenAuth('LOGIN')}
                    className="px-4 py-2 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs rounded-xl shadow-lg cursor-pointer transition-all flex items-center space-x-1.5 flex-shrink-0"
                  >
                    <StudyCoinIcon className="w-3.5 h-3.5" />
                    <span>Claim &amp; Save Coins</span>
                  </button>
                )}
              </div>
            )}

            {/* Silhouette Box with Authentic Dramatic Frame */}
            <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-red-950 border-4 border-red-600 rounded-3xl p-8 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl min-h-[340px]">
              {/* Diagonal Anime Speed Lines Background */}
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

              <img
                src={quizPokemon.artworkUrl}
                alt="Mystery Pokemon"
                className={`w-64 h-64 object-contain transition-all duration-500 select-none ${
                  hasGuessed
                    ? 'filter-none scale-105'
                    : 'brightness-0 invert-0 drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]'
                }`}
              />

              {hasGuessed && (
                <div className="mt-3 text-center animate-in zoom-in-95 duration-200">
                  <span className="text-2xl font-black text-amber-300 capitalize tracking-tight block">
                    It&apos;s {quizPokemon.name.toUpperCase()}! 🎉
                  </span>
                  <p className="text-xs text-slate-300 italic mt-1 max-w-md">
                    &ldquo;{quizPokemon.flavorText || quizPokemon.genus}&rdquo;
                  </p>
                </div>
              )}
            </div>

            {/* Multiple Choice Options */}
            <div className="grid grid-cols-2 gap-3">
              {quizOptions.map(opt => {
                const isSelected = selectedOption === opt;
                const isCorrect = opt.toLowerCase() === quizPokemon.name.toLowerCase();

                let btnStyle = 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-white';
                if (hasGuessed) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-600 border-emerald-400 text-white font-black shadow-lg shadow-emerald-600/30';
                  } else if (isSelected) {
                    btnStyle = 'bg-red-600 border-red-400 text-white font-black';
                  } else {
                    btnStyle = 'bg-slate-900/50 border-slate-800 text-slate-500';
                  }
                }

                return (
                  <button
                    key={opt}
                    onClick={() => handleGuess(opt)}
                    disabled={hasGuessed}
                    className={`p-4 rounded-2xl border text-sm font-bold capitalize transition-all cursor-pointer ${btnStyle}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {hasGuessed && (
              <button
                onClick={setupNewGuessRound}
                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm rounded-2xl shadow-xl transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>NEXT POKÉMON CHALLENGE</span>
              </button>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 3: BATTLE ARENA (TURN-BASED POKÉMON COMBAT)      */}
        {/* ==================================================== */}
        {activeTab === 'battle' && (
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Arena Header */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 font-mono">
                  ACADEMIC BATTLE STADIUM
                </span>
                <h2 className="text-lg font-black text-white">Retro Turn-Based Battle Arena</h2>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-full font-mono font-bold">
                  Wins: {battleWins}
                </span>
                <button
                  onClick={() => startNewBattle(playerPokemon)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl border border-slate-700 transition-colors"
                >
                  Restart Battle
                </button>
              </div>
            </div>

            {/* Stadium Visual Screen */}
            <div className="bg-gradient-to-b from-sky-900 via-slate-900 to-emerald-950 border-4 border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-2xl min-h-[360px] flex flex-col justify-between">
              {/* Top Row: Enemy Pokemon & Enemy HP */}
              <div className="flex items-start justify-between w-full">
                {/* Enemy Status HUD */}
                <div className="bg-black/75 backdrop-blur-md border border-white/20 rounded-2xl p-3 w-56 shadow-xl space-y-1">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="capitalize text-white">{enemyPokemon.name}</span>
                    <span className="text-[10px] font-mono text-slate-400">Lv. 50</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[9px] font-mono text-amber-400 font-bold">HP</span>
                    <div className="flex-1 bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          enemyHp / enemyMaxHp > 0.5 ? 'bg-emerald-500' : enemyHp / enemyMaxHp > 0.2 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${(enemyHp / enemyMaxHp) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right text-[10px] font-mono text-slate-400">
                    {enemyHp} / {enemyMaxHp}
                  </div>
                </div>

                {/* Enemy Sprite with Shake on Hit */}
                <div className={`relative transition-transform ${isAttacking === 'player' ? 'animate-bounce' : ''}`}>
                  <img
                    src={enemyPokemon.animatedSpriteUrl || enemyPokemon.spriteUrl}
                    alt={enemyPokemon.name}
                    className="w-32 h-32 sm:w-40 sm:h-40 object-contain select-none filter drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]"
                  />
                </div>
              </div>

              {/* Bottom Row: Player Pokemon & Player HP */}
              <div className="flex items-end justify-between w-full mt-4">
                {/* Player Sprite */}
                <div className={`relative transition-transform ${isAttacking === 'enemy' ? 'animate-bounce' : ''}`}>
                  <img
                    src={playerPokemon.animatedSpriteUrl || playerPokemon.spriteUrl}
                    alt={playerPokemon.name}
                    className="w-32 h-32 sm:w-40 sm:h-40 object-contain select-none filter drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]"
                  />
                </div>

                {/* Player Status HUD */}
                <div className="bg-black/75 backdrop-blur-md border border-white/20 rounded-2xl p-3 w-56 shadow-xl space-y-1">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="capitalize text-emerald-400">{playerPokemon.name}</span>
                    <span className="text-[10px] font-mono text-slate-400">Lv. 50</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[9px] font-mono text-amber-400 font-bold">HP</span>
                    <div className="flex-1 bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          playerHp / playerMaxHp > 0.5 ? 'bg-emerald-500' : playerHp / playerMaxHp > 0.2 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${(playerHp / playerMaxHp) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right text-[10px] font-mono text-slate-400">
                    {playerHp} / {playerMaxHp}
                  </div>
                </div>
              </div>
            </div>

            {/* Battle Dialogue Box */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-slate-200 min-h-[72px] space-y-1">
              {battleLog.map((log, i) => (
                <p key={i} className={i === 0 ? 'text-amber-300 font-bold' : 'text-slate-500'}>
                  {log}
                </p>
              ))}
            </div>

            {/* Combat Actions (4 Moves) */}
            {battleStatus === 'ongoing' ? (
              <div className="grid grid-cols-2 gap-3">
                {playerMoves.map(m => {
                  const typeStyle = TYPE_COLORS[m.type.toLowerCase()] || TYPE_COLORS.normal;
                  return (
                    <button
                      key={m.name}
                      onClick={() => executeMove(m)}
                      disabled={!isPlayerTurn}
                      className="p-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-2xl text-left transition-all group disabled:opacity-50 cursor-pointer shadow-lg"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-black text-sm text-white group-hover:text-amber-300 transition-colors">
                          {m.name}
                        </span>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${typeStyle.bg} ${typeStyle.text}`}>
                          {m.type}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <span>PWR: {m.power || '--'} • ACC: {m.accuracy}%</span>
                        <span className="capitalize">{m.damageClass}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-3">
                <h3 className="text-xl font-black text-white">
                  {battleStatus === 'victory' ? '🎉 VICTORY! YOU DEFEATED THE OPPONENT!' : '💀 YOU WHITEOUT! BETTER LUCK NEXT TIME!'}
                </h3>
                <button
                  onClick={() => startNewBattle(playerPokemon)}
                  className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-xl shadow-lg shadow-red-600/30 transition-all cursor-pointer"
                >
                  PLAY AGAIN / NEXT OPPONENT
                </button>
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 4: TYPE MATCHUP MASTER QUIZ                      */}
        {/* ==================================================== */}
        {activeTab === 'type_master' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 font-mono">
                  ELEMENTAL LOGIC &amp; STRATEGY
                </span>
                <h2 className="text-xl font-black text-white">Type Effectiveness Trainer</h2>
              </div>
              <span className="font-mono font-bold text-sm bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full">
                Score: {typeScore} / {TYPE_QUESTIONS.length}
              </span>
            </div>

            {/* Question Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
              <div className="space-y-2">
                <span className="text-xs font-mono text-slate-500">
                  Question {typeQuestionIndex + 1} of {TYPE_QUESTIONS.length}
                </span>
                <h3 className="text-lg font-bold text-white leading-snug">
                  {TYPE_QUESTIONS[typeQuestionIndex].q}
                </h3>
              </div>

              {/* Options */}
              <div className="grid grid-cols-2 gap-3">
                {TYPE_QUESTIONS[typeQuestionIndex].options.map(opt => {
                  const isSelected = typeAnswered === opt;
                  const isRight = opt === TYPE_QUESTIONS[typeQuestionIndex].answer;

                  let style = 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-white';
                  if (typeAnswered) {
                    if (isRight) style = 'bg-emerald-600 border-emerald-400 text-white font-bold';
                    else if (isSelected) style = 'bg-red-600 border-red-400 text-white font-bold';
                    else style = 'bg-slate-950/40 border-slate-800 text-slate-600';
                  }

                  return (
                    <button
                      key={opt}
                      disabled={typeAnswered !== null}
                      onClick={() => {
                        setTypeAnswered(opt);
                        if (isRight) setTypeScore(s => s + 1);
                      }}
                      className={`p-4 rounded-2xl border text-sm font-bold transition-all cursor-pointer ${style}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {/* Explanation & Next Button */}
              {typeAnswered && (
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 animate-in fade-in">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    💡 <strong>Explanation:</strong> {TYPE_QUESTIONS[typeQuestionIndex].explanation}
                  </p>
                  <button
                    onClick={() => {
                      setTypeAnswered(null);
                      setTypeQuestionIndex(idx => (idx + 1) % TYPE_QUESTIONS.length);
                    }}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
                  >
                    NEXT QUESTION →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
