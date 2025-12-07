const MersenneTwister = require('mersennetwister');
const {
    spinReels,
    find_pay_lines,
    setPrng,
    STANDARD_BET,
    cash_paylines,
    find_scatter_wins
} = require('./casino');

async function simulate(totalSpins, seed = Date.now(), batchSize = 1_000_000) {
    const mt = new MersenneTwister(seed);
    setPrng(mt);

    let spins = 0;
    let totalBet = 0;
    let totalPayout = 0;
    let paylinePayout = 0;
    let scatterPayout = 0;
    const t0 = Date.now();

    const _spinReels = spinReels;
    const _findPayLines = find_pay_lines;
    const _cashPaylines = cash_paylines;
    const _findScatter = find_scatter_wins;

    while (spins < totalSpins) {
        const run = Math.min(batchSize, totalSpins - spins);

        for (let i = 0; i < run; i++) {
            _spinReels();
            const wins = _findPayLines();

            const payline = _cashPaylines(wins, false);
            const scatter = _findScatter(undefined, false);

            paylinePayout += payline;
            scatterPayout += scatter;
            totalPayout += payline + scatter;
            totalBet += STANDARD_BET;
    }

    spins += run;
    const elapsed = (Date.now() - t0) / 1000;
    const rtp = (totalPayout / totalBet) * 100;
    console.log(`Spins: ${spins.toLocaleString()} / ${totalSpins.toLocaleString()}  elapsed: ${elapsed.toFixed(1)}s  RTP: ${rtp.toFixed(4)}%`);
}

    const totalTimeSec = (Date.now() - t0) / 1000;
    console.log('--- DONE ---');
    console.log(`Total spins: ${totalSpins.toLocaleString()}`);
    console.log(`Total bet: ${totalBet}`);
    console.log(`Total payout: ${totalPayout}`);
    console.log(` - from paylines: ${paylinePayout}`);
    console.log(` - from scatters: ${scatterPayout}`);
    console.log(`RTP: ${(totalPayout / totalBet * 100).toFixed(6)}%`);
    console.log(`Elapsed: ${totalTimeSec.toFixed(1)}s`);
}

const TOTAL = 200_000_000;
const SEED = 2312322;
//2312322 // this seed gives 94.987396%

simulate(TOTAL, SEED).catch(err => {
    console.error(err);
    process.exit(1);
});