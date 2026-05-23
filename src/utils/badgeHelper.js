/**
 * Utility to calculate all earned badges for a user dynamically.
 * Centralizes the logic used across Profile, Companeros, DashboardLayout, etc.
 * 
 * Supports both new schema (hechoHoy, hacerManana) and legacy schema (compromisos).
 */
export const calculateUserBadges = (username, generation, bitacoras) => {
  const earnedBadges = []; // Ya NO se entrega "Mente Abierta" (1) por defecto, requiere 1 bitácora.

  // Filter logs supporting both user and practicante property names
  const userLogs = bitacoras.filter(b => b.user === username || b.practicante === username);
  const hitoCount = userLogs.length;

  // --- Bloque 1, 2, 3: Hitos de Cantidad de Bitácoras ---
  if (hitoCount >= 1) earnedBadges.push(1); // Mente Abierta (1 Bitácora)
  if (hitoCount >= 7) earnedBadges.push(3); // Mente Ligera (7 Bitácoras)
  if (hitoCount >= 15) earnedBadges.push(5); // Cable a Tierra (15 Bitácoras)
  if (hitoCount >= 21) earnedBadges.push(7); // Zis-Zas Mental (21 Bitácoras)
  if (hitoCount >= 30) earnedBadges.push(8); // Hábitat de Calma (30 Bitácoras)
  if (hitoCount >= 45) earnedBadges.push(10); // Paso a Paso (45 Bitácoras)
  if (hitoCount >= 60) earnedBadges.push(12); // Escudo de Papel (60 Bitácoras)
  if (hitoCount >= 75) earnedBadges.push(14); // Foco Claro (75 Bitácoras)
  if (hitoCount >= 90) earnedBadges.push(16); // Maestría Interior (90 Bitácoras)

  // --- Bloque 1, 2, 3: Rachas de Consecutivos ---
  // Get all unique date strings, sort them ascending
  const dates = [...new Set(userLogs.map(l => l.fecha))].sort((a, b) => new Date(a) - new Date(b));
  let maxStreak = 0;
  let currentStreak = 0;
  let prevDate = null;

  dates.forEach(dStr => {
    const d = new Date(dStr);
    d.setHours(12, 0, 0, 0); // set to mid-day to avoid timezone offset issues
    if (!prevDate) {
      currentStreak = 1;
    } else {
      const diffTime = Math.abs(d - prevDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        currentStreak++;
      } else if (diffDays > 1) {
        if (currentStreak > maxStreak) maxStreak = currentStreak;
        currentStreak = 1;
      }
    }
    prevDate = d;
  });
  if (currentStreak > maxStreak) maxStreak = currentStreak;

  if (maxStreak >= 3) earnedBadges.push(2); // Primer Impulso (3 Días Seguidos)
  if (maxStreak >= 7) earnedBadges.push(4); // Semana Imparable (7 Días Seguidos)
  if (maxStreak >= 14) earnedBadges.push(6); // Ritmo Constante (14 Días Seguidos)
  if (maxStreak >= 30) earnedBadges.push(9); // Mes Inquebrantable (30 Días Seguidos)
  if (maxStreak >= 45) earnedBadges.push(11); // Flujo de Paz (45 Días Seguidos)
  if (maxStreak >= 60) earnedBadges.push(13); // Mente de Acero (60 Días Seguidos)
  if (maxStreak >= 75) earnedBadges.push(15); // Faro en la Tormenta (75 Días Seguidos)
  if (maxStreak >= 90) earnedBadges.push(17); // Zen Absoluto (90 Días Seguidos)

  // --- Bloque 4: La Escritura Interior (Words volume) ---
  let totalWords = 0;
  userLogs.forEach(b => {
    const text1 = b.hechoHoy || b.compromisos || '';
    const text2 = b.hacerManana || '';
    const combined = text1 + ' ' + text2;
    totalWords += combined.trim().split(/\s+/).filter(Boolean).length;
  });
  if (totalWords >= 5000) earnedBadges.push(19);
  if (totalWords >= 10000) earnedBadges.push(20);
  if (totalWords >= 25000) earnedBadges.push(21);

  // --- Bloque 5: Rituales del Día (Timestamps) ---
  let writesNight = false; // 22:00 to 00:00 (Noctámbulo Sereno)
  let writesLate = false;  // 00:00 to 04:00 (Último Esfuerzo)
  let writesEarly = false; // 06:00 to 09:00 (Inicio Ligero)

  userLogs.forEach(b => {
    if (b.timestamp) {
      const date = new Date(b.timestamp);
      const hours = date.getHours();
      if (hours >= 22 && hours < 24) writesNight = true;
      if (hours >= 0 && hours < 4) writesLate = true;
      if (hours >= 6 && hours < 9) writesEarly = true;
    }
  });

  if (writesNight) earnedBadges.push(22);
  if (writesLate) earnedBadges.push(23);
  if (writesEarly) earnedBadges.push(24);

  // --- Bloque 6: Resiliencia Emocional ---
  let hasPauseOf3Days = false;
  let hasResumedAndContinued = false;

  for (let i = 1; i < dates.length; i++) {
    const d1 = new Date(dates[i - 1]);
    const d2 = new Date(dates[i]);
    const diffTime = Math.abs(d2 - d1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 3) {
      hasPauseOf3Days = true;
      // If there are subsequent entries, it means they resumed and continued
      if (i < dates.length - 1) {
        hasResumedAndContinued = true;
      }
    }
  }

  if (hasPauseOf3Days) earnedBadges.push(25); // Volver a Empezar
  if (hasResumedAndContinued) earnedBadges.push(26); // Sigue Adelante
  if (hitoCount >= 60) earnedBadges.push(27); // Constancia Real (60 días no consecutivos)

  // --- Especiales: El Creador ---
  if (username === 'Jose Eliecer Rivera Perez' || username === 'Joseph Joestar') {
    earnedBadges.push(18); // El Creador
  }

  // --- Especiales: Jefe de Alpha Docere (Mauro Rojas) ---
  if (username && (username.toLowerCase() === 'mauro rojas' || username.toLowerCase() === 'mauro')) {
    earnedBadges.push(47); // Líder Alpha Docere
  }

  // --- Especiales: Generación de Honor o Miembro General ---
  const genNum = parseInt(generation);
  if (genNum === 17) {
    earnedBadges.push(28); // Generación 17
  } else if (genNum >= 18 && genNum <= 29) {
    // Gen 18 corresponds to ID 29, Gen 19 to 30, ..., Gen 29 to 40
    earnedBadges.push(29 + (genNum - 18));
  } else if (genNum >= 30 && genNum <= 58) {
    // Para Generación 30 a 58, asignaremos un ID dinámico (100 + número)
    // Ej: Gen 30 -> Insignia ID 130
    earnedBadges.push(100 + genNum);
  } else if (genNum > 58) {
    // Para generaciones posteriores a la 58, se otorga la Gen Forever
    earnedBadges.push(200);
  } else {
    // Other users, not from participating generations (o 'Usuarios' generales)
    earnedBadges.push(48); // Miembro de la Comunidad
  }

  // --- Especiales: Desbloqueos de Texto Inteligentes ---
  let unlockedGit = false;
  let unlockedCpanel = false;
  let unlockedWiki = false;
  let unlockedPodcast = false;
  let unlockedEisenhower = false;
  let unlockedBugs = false;

  userLogs.forEach(b => {
    const hecho = (b.hechoHoy || b.compromisos || '').toLowerCase();
    const manana = (b.hacerManana || '').toLowerCase();
    const combined = hecho + ' ' + manana;

    // 1. Git: contains both 'git' and 'rama'
    if (combined.includes('git') && combined.includes('rama')) {
      unlockedGit = true;
    }

    // 2. cPanel: contains 'cpanel'
    if (combined.includes('cpanel')) {
      unlockedCpanel = true;
    }

    // 3. Wiki: contains 'wiki' AND one of the action verbs
    if (combined.includes('wiki') && (
      combined.includes('publiqu') || combined.includes('escrib') ||
      combined.includes('actualiz') || combined.includes('aport') ||
      combined.includes('subi') || combined.includes('cre') ||
      combined.includes('redact')
    )) {
      unlockedWiki = true;
    }

    // 4. Podcast: contains 'podcast' AND one of the participation verbs
    if (combined.includes('podcast') && (
      combined.includes('particip') || combined.includes('grab') ||
      combined.includes('habl') || combined.includes('estuv') ||
      combined.includes('asist') || combined.includes('invit')
    )) {
      unlockedPodcast = true;
    }

    // 5. Eisenhower Matrix: contains 'eisenhower' OR 'matriz' in combination with priorities or organization
    if (combined.includes('eisenhower') || (combined.includes('matriz') && (
      combined.includes('prioridad') || combined.includes('prioriz') || combined.includes('organiz')
    ))) {
      unlockedEisenhower = true;
    }

    // 6. Bug Fixer: contains 'bug', 'fix', or 'correg' combined with 'error'
    if (combined.includes('bug') || combined.includes('fix') || (
      combined.includes('correg') && (combined.includes('error') || combined.includes('fallo') || combined.includes('problema'))
    )) {
      unlockedBugs = true;
    }
  });

  if (unlockedGit) earnedBadges.push(41);
  if (unlockedCpanel) earnedBadges.push(42);
  if (unlockedWiki) earnedBadges.push(43);
  if (unlockedPodcast) earnedBadges.push(44);
  if (unlockedEisenhower) earnedBadges.push(45);
  if (unlockedBugs) earnedBadges.push(46);

  // Return unique earned badges
  return [...new Set(earnedBadges)];
};

export const calculateStreak = (username, bitacoras) => {
  const userLogs = bitacoras.filter(b => b.user === username || b.practicante === username);
  const dates = [...new Set(userLogs.map(l => l.fecha))].sort((a, b) => new Date(b) - new Date(a)); // sorted descending

  if (dates.length === 0) return 0;

  const todayStr = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  // If latest log is not today or yesterday, streak is broken
  const latestLog = dates[0];
  if (latestLog !== todayStr && latestLog !== yesterdayStr) {
    return 0;
  }

  let streak = 0;
  let currentDate = new Date(latestLog);

  // We loop to find consecutive days backward
  for (let i = 0; i < 365; i++) {
    const expectedStr = currentDate.toISOString().split('T')[0];
    if (dates.includes(expectedStr)) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};
