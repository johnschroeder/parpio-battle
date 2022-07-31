import { Army, Unit } from "./Army"
import { UnitInfo, unitInfos, UnitName, UnitSkills } from "./UnitInfo"

export type UnitCount = {
    type: UnitName
    count: number
}
export type BattleLogEntry = {
    stageName: string
    playerRemaining: UnitCount[]
    enemyRemaining: UnitCount[]
}
export type BattleResult = {
    winner: 'player' | 'enemy' | 'draw'
    playerCasualties: UnitCount[]
    enemyCasualties: UnitCount[]
    battleLog: BattleLogEntry[] | undefined
}
export type BattleResults = {
    results: BattleResult[]
    simulationDurationMS: number
    battleDurationSeconds: number
    stats: SimStats
    battleLog: BattleLogEntry[]
}

// Calculate battle time in seconds
function battleTime(playerArmy: Army, enemyArmy: Army, berserk: boolean): number {
    let tierSum = 0;
    unitInfos.forEach(u => {
        tierSum += u.tier * ((playerArmy.count(u.name) || 0) + (enemyArmy.count(u.name) || 0));
    })
    let result = Math.round(Math.pow(tierSum * 2, 1.4));
    if (berserk) result = Math.max(0, result - 2 * 60 * 60) / 2;
    return Math.min(result, 8 * 60 * 60);
}

export type CasualtyStats = {
    roundCount: number
    min: Map<UnitName, number>
    max: Map<UnitName, number>
    total: Map<UnitName, number>
}

export type SimStats = {
    winCount: number
    drawCount: number
    roundCount: number
    enemyCasualties: CasualtyStats
    playerCasualties: CasualtyStats
}

function newSimStats(): SimStats {
    return {
        winCount: 0,
        drawCount: 0,
        roundCount: 0,
        enemyCasualties: {
            roundCount: 0,
            min: new Map<UnitName, number>(),
            max: new Map<UnitName, number>(),
            total: new Map<UnitName, number>(),
        },
        playerCasualties: {
            roundCount: 0,
            min: new Map<UnitName, number>(),
            max: new Map<UnitName, number>(),
            total: new Map<UnitName, number>(),
        }
    }
}

function isSignificantChange(prev: number, next: number): boolean {
    if (prev === 0 && next === 0) return false;
    if (prev === 0 || next === 0) return true;
    return Math.abs(prev - next) / next > 0.05;
}

// returns true if any of the stats had significant changes
function updateCasualtyStats(casualtyStats: CasualtyStats, casualties: UnitCount[]): boolean {
    casualtyStats.roundCount++;
    let significantChange = false;
    casualties.forEach(casualty => {
        const t = casualty.type;
        const c = casualty.count;
        const oldMax = casualtyStats.max.get(t);
        if (oldMax === undefined || c > oldMax) {
            casualtyStats.max.set(t, c);
            if (oldMax === undefined || isSignificantChange(oldMax, c)) significantChange = true;
        }
        const oldMin = casualtyStats.min.get(t);
        if (oldMin === undefined || c < oldMin) {
            casualtyStats.min.set(t, c);
            if (oldMin === undefined || isSignificantChange(oldMin, c)) significantChange = true;
        }
        const oldTotal = casualtyStats.total.get(t);
        if (oldTotal === undefined) {
            significantChange = true;
        } else {
            const oldAvg = oldTotal / (casualtyStats.roundCount - 1);
            const newAvg = (oldTotal + c) / casualtyStats.roundCount;
            if (isSignificantChange(oldAvg, newAvg)) significantChange = true;
        }
        casualtyStats.total.set(t, (oldTotal ?? 0) + c);
    });

    return significantChange;
}

function updateStats(stats: SimStats, br: BattleResult): boolean {
    debugger;
    stats.roundCount++;
    if (br.winner === 'player' || br.winner === 'draw') stats.winCount++;
    if (br.winner === 'draw') stats.drawCount++;

    let significantChange = false;
    if (updateCasualtyStats(stats.enemyCasualties, br.enemyCasualties)) {
        significantChange = true;
    }
    if (updateCasualtyStats(stats.playerCasualties, br.playerCasualties)) {
        significantChange = true;
    }

    return significantChange;
}

const minRoundCount = 50;
const maxRoundCount = 1000;

export async function runSim(playerArmy: Army, enemyArmy: Army, setResults: (results: BattleResults | undefined) => void, berserk: boolean) {
    let results: BattleResult[] = [];
    let stats = newSimStats();
    const startTime = performance.now();
    for (let i = 0; i < maxRoundCount; i++) {
        const result = oneBattle(playerArmy, enemyArmy, i === 0);
        results.push(result);
        const significantChange = updateStats(stats, result);
        if (i + 1 >= minRoundCount && !significantChange) {
            break;
        }
    }
    const endTime = performance.now();
    setResults({
        results: results,
        stats: stats,
        simulationDurationMS: endTime - startTime,
        battleDurationSeconds: battleTime(playerArmy, enemyArmy, berserk),
        battleLog: results[0].battleLog!,
    })
}

function findTarget(units: Unit[], skills: UnitSkills): Unit | undefined {
    if (!skills.flanking) {
        return units.find(u => u.maxHp > 0);
    }
    let weakest: UnitInfo | undefined = undefined;
    units.forEach(u => {
        if (u.maxHp <= 0) {
            return;
        }
        if (!weakest || u.maxHp < weakest.maxHp) {
            weakest = u;
        }
    });
    return weakest;
}

function damage(defenders: Unit[], damage: number, skills: UnitSkills) {
    do {
        let t = findTarget(defenders, skills);
        if (!t) break;
        if (damage < t.maxHp) {
            t.maxHp -= damage;
            damage = 0;
        } else {
            damage -= t.maxHp;
            t.maxHp = 0;
        }
    } while (damage > 0 && skills.trample);
}

function attack(attackers: Unit[], defenders: Unit[]) {
    attackers.forEach((unit) => {
        let dmg = unit.attack;
        if (Math.random() < unit.crit) dmg *= 2;
        damage(defenders, dmg, unit.skills);
    });
}

function removeDead(units: Unit[]): Unit[] {
    return units.filter(u => u.maxHp > 0);
}

function firstPhase(u: Unit): boolean {
    return u.skills.firstStrike || u.skills.doubleStrike;
}

function secondPhase(u: Unit): boolean {
    return !(u.skills.firstStrike || u.skills.lastStrike || u.skills.doubleStrike);
}

function thirdPhase(u: Unit): boolean {
    return u.skills.lastStrike || u.skills.doubleStrike;
}

const phases = [firstPhase, secondPhase, thirdPhase];

function fightPhase(pUnits: Unit[], eUnits: Unit[], filter: (u: Unit) => boolean): [Unit[], Unit[], boolean] {
    const fpUnits = pUnits.filter(filter);
    const feUnits = eUnits.filter(filter);

    attack(fpUnits, eUnits)
    attack(feUnits, pUnits)
    pUnits = removeDead(pUnits);
    eUnits = removeDead(eUnits);
    return [pUnits, eUnits, fpUnits.length !== 0 || feUnits.length !== 0];
}

function casualties(army: Army, remainingUnits: UnitInfo[]): UnitCount[] {
    // reconstruct losses by subtracting remaining units from original army
    let losses = new Map<UnitName, number>();
    unitInfos.forEach(u => {
        const c = army.count(u.name);
        if (c) {
            losses.set(u.name, c);
        }
    });
    remainingUnits.forEach(u => {
        losses.set(u.name, (losses.get(u.name) || 0) - 1);
    });
    let casualties: UnitCount[] = []
    unitInfos.forEach(u => {
        const count = losses.get(u.name);
        if (count === undefined) {
            return;
        }
        casualties.push({ type: u.name, count: count });
    })
    return casualties;
}

function unitCounts(units: Unit[]): UnitCount[] {
    let counts = new Map<UnitName, number>();
    units.forEach(u => {
        counts.set(u.name, (counts.get(u.name) ?? 0) + 1);
    })
    let result: UnitCount[] = [];
    counts.forEach((c, n) => {
        result.push({ type: n, count: c });
    })
    return result;
}

function addToLog(battleLog: BattleLogEntry[], stageName: string, playerUnits: Unit[], enemyUnits: Unit[]) {
    battleLog.push({
        enemyRemaining: unitCounts(enemyUnits),
        playerRemaining: unitCounts(playerUnits),
        stageName: stageName,
    })
}

function oneBattle(playerArmy: Army, enemyArmy: Army, recordLog: boolean = false): BattleResult {
    let battleLog: undefined | BattleLogEntry[] = undefined;
    let pUnits = playerArmy.toUnits();
    let eUnits = enemyArmy.toUnits();

    if (recordLog) {
        battleLog = []
        addToLog(battleLog, "Start", pUnits, eUnits);
    }

    let roundNumber = 1;
    outer:
    while (true) {
        for (let phaseNumber = 0; phaseNumber < phases.length; phaseNumber++) {
            let anyFought = false;
            [pUnits, eUnits, anyFought] = fightPhase(pUnits, eUnits, phases[phaseNumber]);
            if (battleLog && anyFought) {
                addToLog(battleLog, `Round ${roundNumber} ${['first strike', 'normal', 'last strike'][phaseNumber]}`, pUnits, eUnits);
            }
            if (pUnits.length === 0 || eUnits.length === 0) break outer;
        }
        roundNumber++;
    }
    const pCasualties = casualties(playerArmy, pUnits);
    const eCasualties = casualties(enemyArmy, eUnits);

    const winner = eUnits.length > 0 ? 'enemy' : pUnits.length > 0 ? 'player' : 'draw';
    return {
        winner: winner,
        playerCasualties: pCasualties,
        enemyCasualties: eCasualties,
        battleLog: battleLog,
    }
}