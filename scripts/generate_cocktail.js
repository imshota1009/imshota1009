const https = require('https');
const fs = require('fs');
const path = require('path');

function getStarsCount() {
    return new Promise((resolve) => {
        const url = 'https://api.github-star-counter.workers.dev/user/imshota1009';
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve(parseInt(json.stars) || 124);
                } catch (e) {
                    resolve(fallbackStars());
                }
            });
        }).on('error', () => {
            resolve(fallbackStars());
        });
    });
}

function fallbackStars() {
    const svgPath = path.join(__dirname, '..', 'assets', 'cocktail.svg');
    if (fs.existsSync(svgPath)) {
        try {
            const content = fs.readFileSync(svgPath, 'utf8');
            const match = content.match(/Total Stars:\s*(\d+)\s*\/\s*200/);
            if (match) {
                return parseInt(match[1]);
            }
        } catch (e) {}
    }
    return 124;
}

async function main() {
    const stars = await getStarsCount();
    const target = 200;
    const ratio = Math.min(stars / target, 1.0);
    
    // 星の数に応じたカクテル名（バーテンダーからの今日のおすすめ）
    let cocktailName = "";
    if (stars < 50) {
        cocktailName = "Blue Hawaii";
    } else if (stars < 100) {
        cocktailName = "Tequila Sunrise";
    } else if (stars < 150) {
        cocktailName = "Martini";
    } else if (stars < 200) {
        cocktailName = "Cosmopolitan";
    } else {
        cocktailName = "CatMoon Special";
    }
    
    // 星の数に応じた液体の色（確実に表示される単色ネオン）
    let liquidColor = "#00f2fe"; 
    if (stars < 50) {
        liquidColor = "#50fa7b"; // グリーン
    } else if (stars < 100) {
        liquidColor = "#ffb86c"; // オレンジ
    } else if (stars < 150) {
        liquidColor = "#00f2fe"; // シアン
    } else if (stars < 200) {
        liquidColor = "#ff79c6"; // ピンク
    } else {
        liquidColor = "#bd93f9"; // パープル
    }
    
    const yLiquid = 220.0 - (ratio * 100.0);
    const wLiquid = 20.0 + (ratio * 180.0);
    const xLeft = 200.0 - (wLiquid / 2.0);
    const xRight = 200.0 + (wLiquid / 2.0);
    
    const polygonPoints = `${xLeft.toFixed(1)},${yLiquid.toFixed(1)} ${xRight.toFixed(1)},${yLiquid.toFixed(1)} 210,220 190,220`;
    
    let liquidSvg = '';
    if (ratio > 0) {
        liquidSvg = `<polygon points="${polygonPoints}" fill="${liquidColor}" opacity="0.8" />`;
    }
    
    const percent = ratio * 100.0;
    
    // 1. カクテルグラスのSVG生成
    const svgTemplate = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="5" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  <!-- 背景 -->
  <rect width="100%" height="100%" fill="#1a1c23" rx="15" />

  <!-- ネオンの飾り月 -->
  <path d="M 280 80 A 60 60 0 1 0 340 140 A 45 45 0 1 1 280 80 Z" fill="none" stroke="#ffb86c" stroke-width="4" filter="url(#neon-glow)" opacity="0.8" />

  <!-- カクテルの液体 -->
  {liquidSvg}

  <!-- カクテルの泡（ゆらゆら昇るアニメーション） -->
  <g opacity="0.6">
    <circle cx="180" cy="200" r="3" fill="#ffffff">
      <animate attributeName="cy" from="215" to="${Math.max(yLiquid, 125).toFixed(1)}" dur="3s" repeatCount="indefinite" />
      <animate attributeName="opacity" from="1" to="0" dur="3s" repeatCount="indefinite" />
    </circle>
    <circle cx="210" cy="180" r="2" fill="#ffffff">
      <animate attributeName="cy" from="215" to="${Math.max(yLiquid, 125).toFixed(1)}" dur="2.5s" repeatCount="indefinite" begin="0.8s" />
      <animate attributeName="opacity" from="1" to="0" dur="2.5s" repeatCount="indefinite" begin="0.8s" />
    </circle>
    <circle cx="195" cy="160" r="2.5" fill="#ffffff">
      <animate attributeName="cy" from="215" to="${Math.max(yLiquid, 125).toFixed(1)}" dur="4s" repeatCount="indefinite" begin="1.5s" />
      <animate attributeName="opacity" from="1" to="0" dur="4s" repeatCount="indefinite" begin="1.5s" />
    </circle>
  </g>

  <!-- カクテルグラスの本体 -->
  <polygon points="100,120 300,120 210,220 210,290 250,290 250,300 150,300 150,290 190,290 190,220" fill="none" stroke="#ff79c6" stroke-width="5" stroke-linejoin="round" filter="url(#neon-glow)" />

  <!-- カクテルの飾り（レモン） -->
  <path d="M 90 110 A 20 20 0 0 1 110 130" fill="none" stroke="#f1fa8c" stroke-width="4" filter="url(#neon-glow)" />

  <!-- テキスト -->
  <text x="200" y="55" font-family="'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="bold" fill="#00ffff" text-anchor="middle" filter="url(#neon-glow)">CatMoon Bar</text>
  <text x="200" y="320" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" font-style="italic" fill="#ffb86c" text-anchor="middle" opacity="0.9">Today's Drink: ${cocktailName}</text>
  <text x="200" y="350" font-family="'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="bold" fill="#ff79c6" text-anchor="middle">Total Stars: ${stars} / ${target} (${percent.toFixed(1)}%)</text>
  <text x="200" y="380" font-family="'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="bold" fill="#50fa7b" text-anchor="middle" filter="url(#neon-glow)">★ ${stars}</text>
</svg>`;

    const assetsDir = path.join(__dirname, '..', 'assets');
    if (!fs.existsSync(assetsDir)) {
        fs.mkdirSync(assetsDir, { recursive: true });
    }
    fs.writeFileSync(path.join(assetsDir, 'cocktail.svg'), svgTemplate, 'utf8');
    console.log(`Successfully generated assets/cocktail.svg with ${stars} stars (${percent.toFixed(1)}%)`);

    // 2. バーテンダー猫のSVG生成
    let levelTitle = "";
    let catThemeColor = "#ff79c6"; // デフォルト
    let accessorySvg = "";

    if (stars < 50) {
        levelTitle = "Lv.1 Apprentice Cat";
        catThemeColor = "#50fa7b"; // グリーン
        accessorySvg = `
          <!-- 困り顔の吹き出し -->
          <path d="M 230 110 Q 250 90 270 110 Q 290 130 270 150 Q 250 170 240 155 Z" fill="none" stroke="#f1fa8c" stroke-width="2" filter="url(#neon-glow)" />
          <text x="255" y="135" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" fill="#f1fa8c" text-anchor="middle">...?</text>
          <!-- 傾いたシェイカー -->
          <rect x="100" y="240" width="30" height="50" rx="5" transform="rotate(-20 115 265)" fill="none" stroke="#f1fa8c" stroke-width="3" filter="url(#neon-glow)" />
        `;
    } else if (stars < 100) {
        levelTitle = "Lv.2 Adept Mixologist";
        catThemeColor = "#ffb86c"; // オレンジ
        accessorySvg = `
          <!-- 蝶ネクタイ -->
          <polygon points="190,225 210,225 200,235" fill="#ff5555" stroke="#ff5555" stroke-width="1" filter="url(#neon-glow)" />
          <polygon points="190,245 210,245 200,235" fill="#ff5555" stroke="#ff5555" stroke-width="1" filter="url(#neon-glow)" />
          <!-- シェイクのアクション線 -->
          <path d="M 120 220 C 100 210, 90 230, 110 250" fill="none" stroke="#8be9fd" stroke-width="3" filter="url(#neon-glow)" />
          <path d="M 280 220 C 300 210, 310 230, 290 250" fill="none" stroke="#8be9fd" stroke-width="3" filter="url(#neon-glow)" />
          <!-- シェイカー -->
          <rect x="110" y="220" width="25" height="45" rx="5" fill="none" stroke="#ffffff" stroke-width="3" filter="url(#neon-glow)" />
        `;
    } else if (stars < 150) {
        levelTitle = "Lv.3 Master Mixologist";
        catThemeColor = "#ff79c6"; // ピンク
        accessorySvg = `
          <!-- 蝶ネクタイ -->
          <polygon points="190,225 210,225 200,235" fill="#ff5555" stroke="#ff5555" stroke-width="1" filter="url(#neon-glow)" />
          <polygon points="190,245 210,245 200,235" fill="#ff5555" stroke="#ff5555" stroke-width="1" filter="url(#neon-glow)" />
          <!-- 赤いネオンのサングラス -->
          <path d="M 160 170 L 240 170 Q 240 185 225 185 Q 210 185 210 175 L 190 175 Q 190 185 175 185 Q 160 185 160 170 Z" fill="none" stroke="#ff5555" stroke-width="3" filter="url(#neon-glow)" />
          <!-- カウンターに置かれたシェイカー -->
          <rect x="270" y="245" width="25" height="50" rx="5" fill="none" stroke="#50fa7b" stroke-width="3" filter="url(#neon-glow)" />
        `;
    } else if (stars < 200) {
        levelTitle = "Lv.4 Legendary Bartender";
        catThemeColor = "#8be9fd"; // シアン
        accessorySvg = `
          <!-- 蝶ネクタイ -->
          <polygon points="190,225 210,225 200,235" fill="#ff5555" stroke="#ff5555" stroke-width="1" filter="url(#neon-glow)" />
          <polygon points="190,245 210,245 200,235" fill="#ff5555" stroke="#ff5555" stroke-width="1" filter="url(#neon-glow)" />
          <!-- 頭の上のミニ王冠 -->
          <polygon points="185,115 190,130 200,120 210,130 215,115 200,125" fill="none" stroke="#f1fa8c" stroke-width="2" filter="url(#neon-glow)" />
          <!-- 周りの星オーラ -->
          <path d="M 90 120 L 95 125 L 90 130 L 85 125 Z M 310 140 L 315 145 L 310 150 L 305 145 Z" fill="#f1fa8c" filter="url(#neon-glow)" />
        `;
    } else {
        levelTitle = "Lv.5 Cosmic Mixologist";
        catThemeColor = "#bd93f9"; // パープル
        accessorySvg = `
          <!-- 宇宙ヘルメット -->
          <circle cx="200" cy="180" r="75" fill="none" stroke="#8be9fd" stroke-width="3" stroke-dasharray="8,8" filter="url(#neon-glow)" />
          <!-- 流れ星 -->
          <path d="M 80 80 Q 120 100 160 80" fill="none" stroke="#f1fa8c" stroke-width="2" filter="url(#neon-glow)" />
          <circle cx="160" cy="80" r="3" fill="#f1fa8c" filter="url(#neon-glow)" />
        `;
    }

    const catSvgTemplate = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="5" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  <!-- 背景 -->
  <rect width="100%" height="100%" fill="#1a1c23" rx="15" />

  <!-- 猫の耳と顔の輪郭 -->
  <path d="M 140 180 L 140 120 L 175 150 L 225 150 L 260 120 L 260 180 Z" fill="none" stroke="${catThemeColor}" stroke-width="4" stroke-linejoin="round" filter="url(#neon-glow)" />

  <!-- 目 -->
  <ellipse cx="175" cy="175" rx="6" ry="3" fill="#50fa7b" filter="url(#neon-glow)" />
  <ellipse cx="225" cy="175" rx="6" ry="3" fill="#50fa7b" filter="url(#neon-glow)" />

  <!-- 鼻と口 -->
  <path d="M 195 190 Q 200 195 205 190 Q 200 192 195 190 Z" fill="none" stroke="${catThemeColor}" stroke-width="3" />
  <path d="M 200 192 L 200 198 Q 195 205 190 200 M 200 198 Q 205 205 210 200" fill="none" stroke="${catThemeColor}" stroke-width="3" />

  <!-- ひげ -->
  <line x1="125" y1="185" x2="90" y2="180" stroke="#8be9fd" stroke-width="2" filter="url(#neon-glow)" />
  <line x1="125" y1="195" x2="85" y2="195" stroke="#8be9fd" stroke-width="2" filter="url(#neon-glow)" />
  <line x1="125" y1="205" x2="90" y2="210" stroke="#8be9fd" stroke-width="2" filter="url(#neon-glow)" />

  <line x1="275" y1="185" x2="310" y2="180" stroke="#8be9fd" stroke-width="2" filter="url(#neon-glow)" />
  <line x1="275" y1="195" x2="315" y2="195" stroke="#8be9fd" stroke-width="2" filter="url(#neon-glow)" />
  <line x1="275" y1="205" x2="310" y2="210" stroke="#8be9fd" stroke-width="2" filter="url(#neon-glow)" />

  <!-- 体（ベストと肩） -->
  <path d="M 160 220 L 120 300 L 280 300 L 240 220 Z" fill="none" stroke="${catThemeColor}" stroke-width="4" stroke-linejoin="round" filter="url(#neon-glow)" />
  <line x1="200" y1="220" x2="200" y2="300" stroke="${catThemeColor}" stroke-width="2" stroke-dasharray="5,5" />

  <!-- カウンターテーブル -->
  <line x1="40" y1="300" x2="360" y2="300" stroke="#bd93f9" stroke-width="6" stroke-linecap="round" filter="url(#neon-glow)" />

  <!-- レベル別のアクセサリー -->
  ${accessorySvg}

  <!-- テキスト -->
  <text x="200" y="55" font-family="'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="bold" fill="#00ffff" text-anchor="middle" filter="url(#neon-glow)">Cat Bartender</text>
  <text x="200" y="345" font-family="'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="bold" fill="#ffb86c" text-anchor="middle">${levelTitle}</text>
  <text x="200" y="375" font-family="'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="bold" fill="#50fa7b" text-anchor="middle" filter="url(#neon-glow)">Status: Active</text>
</svg>`;

    fs.writeFileSync(path.join(assetsDir, 'cat_bartender.svg'), catSvgTemplate, 'utf8');
    console.log(`Successfully generated assets/cat_bartender.svg (Level: ${levelTitle})`);
}

main();
