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
    
    const yLiquid = 220.0 - (ratio * 100.0);
    const wLiquid = 20.0 + (ratio * 180.0);
    const xLeft = 200.0 - (wLiquid / 2.0);
    const xRight = 200.0 + (wLiquid / 2.0);
    
    const polygonPoints = `${xLeft.toFixed(1)},${yLiquid.toFixed(1)} ${xRight.toFixed(1)},${yLiquid.toFixed(1)} 210,220 190,220`;
    
    let liquidSvg = '';
    if (ratio > 0) {
        liquidSvg = `<polygon points="${polygonPoints}" fill="url(#cocktail-liquid)" opacity="0.85" />`;
    }
    
    const percent = ratio * 100.0;
    
    const svgTemplate = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="5" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <linearGradient id="neon-rim" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ff79c6" />
      <stop offset="100%" stop-color="#bd93f9" />
    </linearGradient>
    <linearGradient id="cocktail-liquid" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#00f2fe" />
      <stop offset="50%" stop-color="#4facfe" />
      <stop offset="100%" stop-color="#9d79ff" />
    </linearGradient>
    <linearGradient id="neon-text" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#00ffff" />
      <stop offset="100%" stop-color="#9d79ff" />
    </linearGradient>
  </defs>

  <!-- 背景 -->
  <rect width="100%" height="100%" fill="#1a1c23" rx="15" />

  <!-- ネオンの飾り月 -->
  <path d="M 280 80 A 60 60 0 1 0 340 140 A 45 45 0 1 1 280 80 Z" fill="none" stroke="#ffb86c" stroke-width="4" filter="url(#neon-glow)" opacity="0.8" />

  <!-- カクテルの液体 -->
  ${liquidSvg}

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
  <polygon points="100,120 300,120 210,220 210,290 250,290 250,300 150,300 150,290 190,290 190,220" fill="none" stroke="url(#neon-rim)" stroke-width="5" stroke-linejoin="round" filter="url(#neon-glow)" />

  <!-- カクテルの飾り（レモン） -->
  <path d="M 90 110 A 20 20 0 0 1 110 130" fill="none" stroke="#f1fa8c" stroke-width="4" filter="url(#neon-glow)" />

  <!-- テキスト -->
  <text x="200" y="55" font-family="'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="bold" fill="url(#neon-text)" text-anchor="middle" filter="url(#neon-glow)">CatMoon Bar</text>
  <text x="200" y="340" font-family="'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="bold" fill="#ff79c6" text-anchor="middle">Total Stars: ${stars} / ${target} (${percent.toFixed(1)}%)</text>
  <text x="200" y="375" font-family="'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="bold" fill="#50fa7b" text-anchor="middle" filter="url(#neon-glow)">★ ${stars}</text>
</svg>`;

    const assetsDir = path.join(__dirname, '..', 'assets');
    if (!fs.existsSync(assetsDir)) {
        fs.mkdirSync(assetsDir, { recursive: true });
    }
    fs.writeFileSync(path.join(assetsDir, 'cocktail.svg'), svgTemplate, 'utf8');
    console.log(`Successfully generated assets/cocktail.svg with ${stars} stars (${percent.toFixed(1)}%)`);
}

main();
