let SCREEN = [
    [null, null, null, null, null],
    [null, null, null, null, null],
    [null, null, null, null, null]
]

let BALANCE = 10000;

const STANDARD_BET = 10;

const MIN_PAYLINE_LENGTH = 3;
const MAX_PAYLINE_LENGTH = 5;
const SCATTER_REQUIRED = 3;

// Scatter payout chances are keys, values are multipliers of the bet
const SCATTER_SCORE = {
    0.0045: 1000,
    0.045: 100,
    0.09: 50,
    1: 20,
}

const SYMBOL_SCORE = {
    '🍒': {
        x3: 0.4,
        x4: 0.6,
        x5: 1
    },
    '🍋': {  
        x3: 0.3,
        x4: 0.4,
        x5: 1.5
    },
    '🍊': {
        x3: 0.6,
        x4: 0.8,
        x5: 1.5
    },
    '🍉': {
        x3: 0.45,
        x4: 0.25,
        x5: 3
    },
    '⭐': {
        x3: 0.2,
        x4: 1,
        x5: 4
    },
    '🔔': {
        x3: 0.5,
        x4: 0.8,
        x5: 1
    },
    '🍎': {
        x3: 0.4,
        x4: 0.7,
        x5: 3.2
    },
    '🍍': {
        x3: 2,
        x4: 3,
        x5: 4 
    }
}

const DEFAULT_SYMBOLS = ['🍒', '🍋', '🍊', '🍉', '⭐', '🔔', '🍎', '🍍']
const SCATTER_SYMBOL = '💰'
const WILD_SYMBOL = '🃏'

const PAYLINES = require('./paylines.js').PAYLINES;
const MersenneTwister = require('mersennetwister');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
let mt = new MersenneTwister();

// If matrix is matrix[Y][X], then Y and X are coordinates where (0,0) is top-left

const REELS = [
  ['🍊','🔔','🍒','🍍','🍋'],
  ['💰','🍉','⭐','🍊','🃏'],
  ['🍋','🍍','🔔','🍒','🍊'],
  ['⭐','🍒','🍎','🍉','🍋'],
  ['🍉','🍍','🍊','🔔','🍒'],
  ['🔔','💰','🍋','🃏','🍎'],
  ['🍍','⭐','🍒','🍋','🍊'],
  ['🍎','🃏','🔔','🍍','⭐'],
  ['🍋','🍊','🍍','🍒','🍉'],
  ['🍒','🍎','⭐','🔔','🍊'],
  ['🍊','🍉','🍋','🍎','🔔'],
  ['🍋','🍊','💰','🍍','🍒'], 
  ['🍍','🍎','🍒','🍉','🍋'],
  ['⭐','🍊','🔔','🍎','🍍'],
  ['🍎','🍒','🍋','🍊','🃏'],
  ['🍉','🔔','🍍','⭐','🍎'],
  ['🍊','🍋','🍎','🍍','💰'],
  ['🍋','⭐','🍉','🃏','🔔'],
  ['🍍','🍒','🍊','💰','⭐'],
  ['🔔','🍊','🍋','🍉','🍎']
];

function rand_reel_idx() {
    return Math.floor(mt.random() * REELS.length)
}

function setPrng(newMt) {
    mt = newMt;
}

function find_reel_positions() {
    const n = REELS.length;
    const center = rand_reel_idx();
    const top = (center - 1 + n) % n; // if center is 0, top should be n-1
    const bottom = (center + 1) % n; // if center is n-1, bottom should be 0
    return [top, center, bottom];
}

function spinReels() {
    for (let col = 0; col < SCREEN[0].length; col++ ) {
        let reel_pos = find_reel_positions(col)
        const column_symbols = reel_pos.map(reel_pos => REELS[reel_pos][col]) // reel pos to symbol
        for (const idx in SCREEN) {
            SCREEN[idx][col] = column_symbols[idx] //put symbols into screen
        }
    }
}

function find_pay_lines() {
    let win_list = []
    for (const mask of PAYLINES) {
        const symbols = extractPaylineSymbols(mask) // get symbols for this payline
        const result = isValidPayline(symbols) // check if they form a payline and of what lenght, returns object or undefined
        if (result) {
            win_list.push(result)
        }
    }
    return win_list // { '🍒': 4, '🍋': 3} || undefined
}

function cash_paylines(win_list, LOG_PAYOUT = true) {
    let payout = 0
    for (const win of win_list) {
        const base_symbol = Object.keys(win)[0]
        const match_length = win[base_symbol]
        
        const scoreEntry = SYMBOL_SCORE[base_symbol]; 
        if (!scoreEntry) { //in this instance, it is for wild symbol only - wild symbols do not have own payouts
            if (LOG_PAYOUT) console.warn(`No SYMBOL_SCORE entry for "${base_symbol}", skipping payout for this win.`);
            continue;
        }

        const payout_multiplier = SYMBOL_SCORE[base_symbol]['x' + match_length] || 0 
        payout += (STANDARD_BET * payout_multiplier)
        if (LOG_PAYOUT) console.log(`You won ${STANDARD_BET * payout_multiplier} with ${match_length} ${base_symbol} symbols!`)
    }
    if (LOG_PAYOUT) console.log(`Total payout: ${payout}`)
    return payout
}

function extractPaylineSymbols(paylineMask) { // extract symbols from SCREEN based on payline mask
    const symbols = [];
    for (let y = 0; y < SCREEN.length; y++) {
        for (let x = 0; x < SCREEN[y].length; x++) {
            if (paylineMask[y][x] === 1) {
                symbols.push(SCREEN[y][x]);
            }
        }
    }
    return symbols;
}

function isValidPayline(symbols) {
    let base = null;
    for (const s of symbols) {
        if (s && s !== WILD_SYMBOL) { base = s; break; }
    }
    if (!base) base = WILD_SYMBOL; // all wilds case

    let length = 0;
    for (let i = 0; i < symbols.length; i++) { // count matching from left to right
        const s = symbols[i];
        if (s === base || s === WILD_SYMBOL) length++;
        else break;
    }

    if (length >= MIN_PAYLINE_LENGTH && length <= MAX_PAYLINE_LENGTH) { 
        return { [base]: length };
    }
    return undefined;
}

function find_scatter_wins(scatterSymbol = SCATTER_SYMBOL, LOG_PAYOUT = true) {
    function calculate_scatter_payout() {
        let from0to1 = mt.random();
        const thresholds = Object.keys(SCATTER_SCORE) // turn keys into sorted float array
            .map(k => parseFloat(k))
            .sort((a, b) => a - b);
        for (const chanceKey of thresholds) {  // since array is sorted, first match is the right one
            if (from0to1 <= chanceKey) { 
                return SCATTER_SCORE[chanceKey];
            }
        }
        console.error('Error calculating scatter payout');
    }
    let scatterMult = 0;
    let scatterCount = 0;
    for (let y = 0; y < SCREEN.length; y++) {
        for (let x = 0; x < SCREEN[y].length; x++) {
            if (SCREEN[y][x] === scatterSymbol) scatterCount++;
        }
    }
    
    if (scatterCount >= SCATTER_REQUIRED) {
        scatterMult = calculate_scatter_payout();
    }

    if (scatterMult === 0) return 0;

    if (LOG_PAYOUT) console.log(`You won ${STANDARD_BET * scatterMult} from scatter symbols!`);

    return STANDARD_BET * scatterMult;
}

async function main() {
    function ask(prompt) {
        return new Promise(resolve => rl.question(prompt, ans => resolve(ans)));
    } 

    console.log('Press Enter to spin, type q then Enter to quit.');
    while (true) {
        console.log(`Balance: ${BALANCE}`);
        const ans = (await ask('> ')).trim().toLowerCase(); 
        if (ans === 'q') {
            console.log('Quitting.');
            rl.close();
            break;
        }

        BALANCE -= STANDARD_BET;

        if (BALANCE < 0) {
            console.log('Insufficient balance to spin.');
            rl.close();
            break;
        }
        
        spinReels();
        const paylines = find_pay_lines();
        BALANCE += cash_paylines(paylines);
        BALANCE += find_scatter_wins();
        console.table(SCREEN);
    }
}

if (require.main === module) {
    main().catch(err => {
        console.error(err);
        rl.close();
    });
}

module.exports = {
    SCREEN,
    REELS,
    spinReels,
    find_pay_lines,
    extractPaylineSymbols,
    isValidPayline,
    rand_reel_idx,
    find_reel_positions,
    cash_paylines,
    find_scatter_wins,
    setPrng,
    STANDARD_BET,
    WILD_SYMBOL,
    symbol_score: SYMBOL_SCORE,
};