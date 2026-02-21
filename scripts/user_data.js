/**
 * User Data Manager
 * ユーザーの進捗データをlocalStorageで管理する
 */

const STORAGE_KEY = 'memo_game_user_data_v1';

const DEFAULT_DATA = {
    userName: 'Player',
    totalScore: 0,
    examsTaken: 0,
    history: [],   // { date, title, score, maxScore, rank }
    badges: [],    // 'first_exam', 'perfect_score', etc.
    favorites: []  // { id, title, category }
};

function getUserData() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return { ...DEFAULT_DATA, favorites: [] };
    try {
        const parsed = JSON.parse(data);
        // favoritesがない古いデータとの互換性
        if (!parsed.favorites) parsed.favorites = [];
        return { ...DEFAULT_DATA, ...parsed };
    } catch (e) {
        console.error("Failed to parse user data", e);
        return { ...DEFAULT_DATA, favorites: [] };
    }
}

function saveUserData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function addExamResult(result) {
    // result: { title, score, max, rank }
    const data = getUserData();

    // Update Stats
    data.examsTaken++;
    data.totalScore += result.score;

    // Add History
    data.history.unshift({
        date: new Date().toISOString(),
        ...result
    });

    // Limit History size
    if (data.history.length > 50) {
        data.history = data.history.slice(0, 50);
    }

    // Check Badges
    checkBadges(data, result);

    saveUserData(data);
    return data;
}

function checkBadges(data, lastResult) {
    const newBadges = [];

    // Helper
    const addBadge = (id) => {
        if (!data.badges.includes(id)) {
            data.badges.push(id);
            newBadges.push(id);
        }
    };

    // First Exam
    if (data.examsTaken === 1) addBadge('first_step');

    // Perfect Score
    if (lastResult.score > 0 && lastResult.score === lastResult.max) addBadge('perfectionist');

    // Score Milestones
    if (data.totalScore >= 100) addBadge('score_100');
    if (data.totalScore >= 500) addBadge('score_500');
    if (data.totalScore >= 1000) addBadge('score_1000');

    // Rank S
    if (lastResult.rank === 'S') addBadge('rank_s_master');

    return newBadges;
}

function updateUserName(name) {
    const data = getUserData();
    data.userName = name;
    saveUserData(data);
}

// お気に入り追加
function addFavorite(item) {
    const data = getUserData();
    // 重複チェック（titleで判定）
    if (!data.favorites.find(f => f.title === item.title)) {
        data.favorites.push({
            title: item.title,
            category: item.category || '',
            addedAt: new Date().toISOString()
        });
        saveUserData(data);
    }
    return data;
}

// お気に入り削除
function removeFavorite(title) {
    const data = getUserData();
    data.favorites = data.favorites.filter(f => f.title !== title);
    saveUserData(data);
    return data;
}

// お気に入り判定
function isFavorite(title) {
    const data = getUserData();
    return data.favorites.some(f => f.title === title);
}

// ストリーク計算（連続日数・週・月・年）
function getStreaks() {
    const data = getUserData();
    if (data.history.length === 0) {
        return { days: 0, weeks: 0, months: 0, years: 0 };
    }

    // 日付のみ（時刻を除去）のSetを作成
    const examDates = new Set();
    data.history.forEach(h => {
        const d = new Date(h.date);
        examDates.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
    });

    const sortedDates = Array.from(examDates).sort().reverse(); // 新しい順

    // 連続日数の計算
    let dayStreak = 0;
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // 今日か昨日からスタート
    let checkDate = new Date(today);
    if (!examDates.has(todayStr)) {
        // 今日やってない場合は昨日からチェック
        checkDate.setDate(checkDate.getDate() - 1);
        const yesterdayStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
        if (!examDates.has(yesterdayStr)) {
            // 昨日もやってなければストリーク0
            return { days: 0, weeks: 0, months: 0, years: 0 };
        }
    }

    while (true) {
        const dateStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
        if (examDates.has(dateStr)) {
            dayStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            break;
        }
    }

    // 連続週の計算（1週間に1回以上やっていれば連続）
    let weekStreak = 0;
    const getWeekKey = (d) => {
        const jan1 = new Date(d.getFullYear(), 0, 1);
        const weekNum = Math.ceil(((d - jan1) / 86400000 + jan1.getDay() + 1) / 7);
        return `${d.getFullYear()}-W${weekNum}`;
    };
    const examWeeks = new Set();
    data.history.forEach(h => examWeeks.add(getWeekKey(new Date(h.date))));

    let checkWeekDate = new Date(today);
    while (true) {
        const wk = getWeekKey(checkWeekDate);
        if (examWeeks.has(wk)) {
            weekStreak++;
            checkWeekDate.setDate(checkWeekDate.getDate() - 7);
        } else {
            break;
        }
    }

    // 連続月の計算
    let monthStreak = 0;
    const getMonthKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const examMonths = new Set();
    data.history.forEach(h => examMonths.add(getMonthKey(new Date(h.date))));

    let checkMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    while (true) {
        const mk = getMonthKey(checkMonth);
        if (examMonths.has(mk)) {
            monthStreak++;
            checkMonth.setMonth(checkMonth.getMonth() - 1);
        } else {
            break;
        }
    }

    // 連続年の計算
    let yearStreak = 0;
    const examYears = new Set();
    data.history.forEach(h => examYears.add(new Date(h.date).getFullYear()));

    let checkYear = today.getFullYear();
    while (examYears.has(checkYear)) {
        yearStreak++;
        checkYear--;
    }

    return { days: dayStreak, weeks: weekStreak, months: monthStreak, years: yearStreak };
}

// Badge Definitions (Metadata)
const BADGE_INFO = {
    'first_step': { icon: '🌱', name: 'はじめの一歩', desc: '初めて検定を受けた' },
    'perfectionist': { icon: '👑', name: '完全制覇', desc: '満点を取った' },
    'score_100': { icon: '🥉', name: '知識の芽', desc: '累計スコア100到達' },
    'score_500': { icon: '🥈', name: '知識の蕾', desc: '累計スコア500到達' },
    'score_1000': { icon: '🥇', name: '知識の花', desc: '累計スコア1000到達' },
    'rank_s_master': { icon: '✨', name: 'Sランクの輝き', desc: 'Sランクを獲得した' }
};

// Export
window.UserData = {
    get: getUserData,
    addResult: addExamResult,
    updateName: updateUserName,
    addFavorite: addFavorite,
    removeFavorite: removeFavorite,
    isFavorite: isFavorite,
    getStreaks: getStreaks,
    BADGES: BADGE_INFO
};
