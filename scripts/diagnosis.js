const questions = [
    {
        id: 1,
        text: "歴史の年号を覚えるなら？",
        options: [
            { text: "語呂合わせのリズムで覚える", type: "rhythm" },
            { text: "その時代のドラマや背景を想像する", type: "story" },
            { text: "年表の位置や図として捉える", type: "visual" }
        ]
    },
    {
        id: 2,
        text: "新しい英単語に出会ったら？",
        options: [
            { text: "何度も発音してみる", type: "rhythm" },
            { text: "例文を作って状況を思い浮かべる", type: "story" },
            { text: "単語の綴りの形や色をイメージする", type: "visual" }
        ]
    },
    {
        id: 3,
        text: "部屋の片付けをする時は？",
        options: [
            { text: "音楽をかけて勢いでやる", type: "rhythm" },
            { text: "「これはあの時の思い出…」と浸ってしまう", type: "story" },
            { text: "パズルみたいにきっちり収めるのが快感", type: "visual" }
        ]
    },
    {
        id: 4,
        text: "本を読むなら？",
        options: [
            { text: "テンポよくサクサク読みたい", type: "rhythm" },
            { text: "登場人物の感情に移入してじっくり読む", type: "story" },
            { text: "図解や写真が多いと嬉しい", type: "visual" }
        ]
    },
    {
        id: 5,
        text: "テスト直前の休み時間は？",
        options: [
            { text: "重要単語をぶつぶつ唱える", type: "rhythm" },
            { text: "流れを確認してストーリーをおさらい", type: "story" },
            { text: "ノートのまとめページをスクショみたいに目に焼き付ける", type: "visual" }
        ]
    }
];

const results = {
    rhythm: {
        title: "🎶 リズム・アーティスト型",
        desc: "あなたの脳は音楽的！音やテンポに乗せることで、驚くほど記憶が定着します。座って黙読するより、歩きながらぶつぶつ唱えたり、即興ソングを作ったりするのが最強の攻略法。",
        weapon: "最強の武器：語呂合わせラップ / 歩き暗記"
    },
    story: {
        title: "📖 ストーリー・テラー型",
        desc: "エピソード記憶の達人。無機質なデータも「物語」に変換することで、強烈に脳に刻み込みます。丸暗記は苦手でも、背景や「なぜ？」を知ると一瞬で覚えられるタイプ。",
        weapon: "最強の武器：歴史マンガ化 / 感情こじつけ"
    },
    visual: {
        title: "📸 ビジュアル・ハンター型",
        desc: "見たものを写真のように保存する能力の持ち主。文字情報も「形」や「配置」として認識しやすいです。きれいなノート作りや、図解・マインドマップ作成が攻略の鍵。",
        weapon: "最強の武器：マインドマップ / 色分けマーカー"
    }
};

let currentQuestion = 0;
let scores = { rhythm: 0, story: 0, visual: 0 };

document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('start-diagnosis');
    const diagnosisArea = document.getElementById('diagnosis-area');
    const questionContainer = document.getElementById('question-container');
    const resultContainer = document.getElementById('result-container');

    startBtn.addEventListener('click', () => {
        startBtn.parentElement.style.display = 'none'; // Hide intro
        diagnosisArea.style.display = 'block';
        showQuestion();
    });

    function showQuestion() {
        if (currentQuestion >= questions.length) {
            showResult();
            return;
        }

        const q = questions[currentQuestion];
        const html = `
            <div class="diagnosis-card animate-fade-in">
                <div class="progress-text">Q. ${currentQuestion + 1} / ${questions.length}</div>
                <h3 class="question-text">${q.text}</h3>
                <div class="options">
                    ${q.options.map((opt, index) => `
                        <button class="btn option-btn" data-type="${opt.type}" style="animation-delay: ${index * 0.1}s">
                            ${opt.text}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
        questionContainer.innerHTML = html;

        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.target.dataset.type;
                scores[type]++;
                currentQuestion++;
                // Slight delay for animation
                setTimeout(showQuestion, 300);
            });
        });
    }

    function showResult() {
        // Find max score
        let maxType = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
        // Handle ties (simple priority or random could work, taking simple priority for now)

        const result = results[maxType];

        questionContainer.style.display = 'none';
        resultContainer.style.display = 'block';

        resultContainer.innerHTML = `
            <div class="diagnosis-result animate-fade-in">
                <span class="result-label">あなたのプレイスタイルは...</span>
                <h2 class="result-title text-gradient">${result.title}</h2>
                <p class="result-desc">${result.desc}</p>
                <div class="result-weapon">
                    ${result.weapon}
                </div>
                <div style="margin-top: 2rem;">
                    <a href="guide.html" class="btn btn-primary">攻略本（ノウハウ）を見る</a>
                    <button onclick="location.reload()" class="btn">もう一度診断する</button>
                </div>
            </div>
        `;
    }
});
