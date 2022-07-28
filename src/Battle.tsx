import React, { useEffect, useMemo, useState } from 'react';
import { Army, Unit } from './Army';
import { UnitInfo, unitInfos, UnitName, UnitSkills } from './UnitInfo';

type Casualty = {
    type: UnitName
    count: number
}
type BattleResult = {
    winner: 'player' | 'enemy' | 'draw'
    playerCasualties: Casualty[]
    enemyCasualties: Casualty[]
}
type BattleResults = {
    results: BattleResult[]
    simulationDurationMS: number
    battleDurationSeconds: number
    stats: SimStats
}

type BattleProps = {
    playerArmy: Army
    enemyArmy: Army
    berserk: boolean;
}

export function Battle(props: BattleProps) {
    const [results, setResults] = useState<BattleResults | undefined>(undefined);

    const showResults = useMemo(() => {
        return props.playerArmy.hasUnits() && props.enemyArmy.hasUnits();
    }, [props.playerArmy, props.enemyArmy])

    useEffect(() => {
        if (showResults) {
            runSim(props.playerArmy, props.enemyArmy, setResults, props.berserk);
        } else {
            setResults(undefined);
        }
    }, [props.playerArmy, props.enemyArmy])

    return <div className="battle">
        <h2>Simulation Results</h2>
        {/* <button className="run" onClick={() => runSim(props.playerArmy, props.enemyArmy, setResults)}> Attack! </button> */}
        <ResultsDisplay results={results} />
    </div>
}

function formatSeconds(seconds: number): string {
    let out_seconds = seconds % 60;
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    minutes = minutes % 60;
    return (hours > 0 ? hours + "h " : "") + (minutes > 0 ? minutes + "m " : "") + (out_seconds > 0 ? out_seconds + "s " : "")
}

function decimal(v: number): number {
    return Math.round(v * 100) / 100;
}

function Losses(props: { desc: string, casualties: CasualtyStats, roundCount: number }) {
    const cs = props.casualties;
    const types = Array.from(cs.total.keys());
    return <figure>
        <figcaption>Expected losses ({props.desc}):</figcaption>
        <>
            {types.map(t =>
                <li key={t}>
                    {t}: {decimal((cs.total.get(t) ?? 0) / cs.roundCount)}
                    {cs.min.get(t) !== cs.max.get(t) && <> ({cs.min.get(t) ?? 0} - {cs.max.get(t) ?? 0})</>}
                </li>
            )}
        </>
    </figure>
}

function ResultsDisplay(props: { results: BattleResults | undefined }) {
    if (!props.results) {
        return null;
    }

    const stats = props.results.stats;

    return <div className="results">
        <h2>
            Wins: {decimal((100 * stats.winCount) / stats.roundCount)}% &gt;
            Draws: {decimal((100 * stats.drawCount) / stats.roundCount)}% &gt;
            Losses: {decimal(100 - (100 * stats.winCount) / stats.roundCount)}%
        </h2>
        <div className="losses">
            <Losses desc="orcs" casualties={stats.enemyCasualties} roundCount={stats.roundCount} />
            <Losses desc="you" casualties={stats.playerCasualties} roundCount={stats.roundCount} />
        </div>
        Battle time: {formatSeconds(props.results.battleDurationSeconds)}
        {/* Simulation ran {props.results.stats.roundCount} battles in {props.results.simulationDurationMS}ms. */}
    </div>
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

type CasualtyStats = {
    roundCount: number
    min: Map<UnitName, number>
    max: Map<UnitName, number>
    total: Map<UnitName, number>
}

type SimStats = {
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
function updateCasualtyStats(casualtyStats: CasualtyStats, casualties: Casualty[]): boolean {
    let significantChange = false;
    casualties.forEach(casualty => {
        casualtyStats.roundCount++;
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
    stats.roundCount++;
    if (br.winner == 'player' || br.winner == 'draw') stats.winCount++;
    if (br.winner == 'draw') stats.drawCount++;

    let significantChange = false;
    significantChange ||= updateCasualtyStats(stats.enemyCasualties, br.enemyCasualties);
    significantChange ||= updateCasualtyStats(stats.playerCasualties, br.playerCasualties);

    return significantChange;
}

const minRoundCount = 50;
const maxRoundCount = 1000;

async function runSim(playerArmy: Army, enemyArmy: Army, setResults: (results: BattleResults | undefined) => void, berserk: boolean) {
    let results: BattleResult[] = [];
    let stats = newSimStats();
    const startTime = performance.now();
    for (let i = 0; i < maxRoundCount; i++) {
        const result = oneBattle(playerArmy, enemyArmy);
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

function fightPhase(pUnits: Unit[], eUnits: Unit[], filter: (u: Unit) => boolean): [Unit[], Unit[]] {
    attack(pUnits.filter(filter), eUnits);
    attack(eUnits.filter(filter), pUnits);
    pUnits = removeDead(pUnits);
    eUnits = removeDead(eUnits);
    return [pUnits, eUnits];
}

function casualties(army: Army, remainingUnits: UnitInfo[]): Casualty[] {
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
    let casualties: Casualty[] = []
    unitInfos.forEach(u => {
        const count = losses.get(u.name);
        if (count === undefined) {
            return;
        }
        casualties.push({ type: u.name, count: count });
    })
    return casualties;
}

function oneBattle(playerArmy: Army, enemyArmy: Army): BattleResult {
    console.time('toUnits');
    let pUnits = playerArmy.toUnits();
    let eUnits = enemyArmy.toUnits();
    console.timeEnd('toUnits');
    outer:
    while (true) {
        for (let i = 0; i < phases.length; i++) {
            [pUnits, eUnits] = fightPhase(pUnits, eUnits, phases[i]);
            if (pUnits.length == 0 || eUnits.length == 0) break outer;
        }
    }
    console.time('casualties');
    const pCasualties = casualties(playerArmy, pUnits);
    const eCasualties = casualties(enemyArmy, eUnits);
    console.timeEnd('casualties');

    const winner = eUnits.length > 0 ? 'enemy' : pUnits.length > 0 ? 'player' : 'draw';
    return {
        winner: winner,
        playerCasualties: pCasualties,
        enemyCasualties: eCasualties,
    }
}