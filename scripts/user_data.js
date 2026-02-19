/**
 * User Data Manager
 * Handles saving/loading user progress to localStorage.
 */

const STORAGE_KEY = 'memo_game_user_data_v1';

const DEFAULT_DATA = {
    userName: 'Player',
    totalScore: 0,
    examsTaken: 0,
    history: [], // { date, title, score, maxScore, rank }
    badges: []   // 'first_exam', 'perfect_score', etc.
};

function getUserData() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return DEFAULT_DATA;
    try {
        return { ...DEFAULT_DATA, ...JSON.parse(data) };
    } catch (e) {
        console.error("Failed to parse user data", e);
        return DEFAULT_DATA;
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

// Badge Definitions (Metadata)
const BADGE_INFO = {
    'first_step': { icon: '🌱', name: 'はじめの一歩', desc: '初めて検定を受けた' },
    'perfectionist': { icon: '👑', name: '完全制覇', desc: '満点を取った' },
    'score_100': { icon: '🥉', name: '知識の芽', desc: '累計スコア100到達' },
    'score_500': { icon: '🥈', name: '知識の蕾', desc: '累計スコア500到達' },
    'score_1000': { icon: '🥇', name: '知識の花', desc: '累計スコア1000到達' },
    'rank_s_master': { icon: '✨', name: 'Sランクの輝き', desc: 'Sランクを獲得した' }
};

// Export for usage if needed, though this is simple script inclusion
window.UserData = {
    get: getUserData,
    addResult: addExamResult,
    updateName: updateUserName,
    BADGES: BADGE_INFO
};
