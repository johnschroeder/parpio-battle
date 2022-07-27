import React, { useState } from 'react';
import { Army, Unit } from './Army';
import { UnitInfo, unitInfos, UnitSkills } from './UnitInfo';

type Casualty = {
    type: string
    count: number
}
type BattleResult = {
    winner: 'player' | 'enemy' | 'draw'
    playerCasualties: Casualty[]
    enemyCasualties: Casualty[]
}
type BattleResults = {
    results: BattleResult[]
    durationInSeconds: number;
}

type BattleProps = {
    playerArmy: Army
    enemyArmy: Army
}

export function Battle(props: BattleProps) {
    const [results, setResults] = useState<BattleResults | undefined>(undefined);
    const [round, setRound] = useState<number | undefined>(undefined);
    return <div className="battle">
        <button className="run" onClick={() => runSim(props.playerArmy, props.enemyArmy, setRound, setResults)}> Attack! </button>
        {round && <div>Simulating round #{round}</div>}
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

function Losses(props: { desc: string, casualties: Casualty[][] }) {
    let max = new Map<string, number>();
    let avg = new Map<string, number>();
    let min = new Map<string, number>();
    props.casualties.forEach(cs => {
        cs.forEach(casualty => {
            const t = casualty.type;
            const c = casualty.count;
            const oldMax = max.get(t);
            if (oldMax === undefined || c > oldMax) {
                max.set(t, c);
            }
            const oldMin = min.get(t);
            if (oldMin === undefined || c < oldMin) {
                min.set(t, c);
            }
            avg.set(t, (avg.get(t) ?? 0) + c / props.casualties.length);
        })
    });
    const types = Array.from(avg.keys());
    return <figure>
        <figcaption>Expected losses ({props.desc}):</figcaption>
        <>
            {types.map(t =>
                <li key={t}>
                    {t}: {decimal(avg.get(t) ?? 0)}{min.get(t) !== max.get(t) && <> ({min.get(t) ?? 0} - {max.get(t) ?? 0})</>}
                </li>
            )}
        </>
    </figure>
}

function ResultsDisplay(props: { results: BattleResults | undefined }) {
    if (!props.results) {
        return null;
    }
    let winCount = 0;
    let drawCount = 0;
    let roundCount = 0;
    props.results.results.forEach(r => {
        roundCount++;
        if (r.winner == 'player' || r.winner == 'draw') winCount++;
        if (r.winner == 'draw') drawCount++;
    })

    return <div className="results">
        <h2>
            Wins: {decimal((100 * winCount) / roundCount)}% &gt;
            Draws: {decimal((100 * drawCount) / roundCount)}% &gt;
            Losses: {decimal(100 - (100 * winCount) / roundCount)}%
        </h2>
        <div className="losses">
            <Losses desc="orcs" casualties={props.results.results.map(r => r.enemyCasualties)} />
            <Losses desc="you" casualties={props.results.results.map(r => r.playerCasualties)} />
        </div>
        Battle time: {formatSeconds(props.results.durationInSeconds)}
    </div>
}

const roundCount = 1000;

// Calculate battle time in seconds
function battleTime(playerArmy: Army, enemyArmy: Army, perk: boolean): number {
    let tierSum = 0;
    unitInfos.forEach(u => {
        tierSum += u.tier * ((playerArmy.count(u.name) || 0) + (enemyArmy.count(u.name) || 0));
    })
    let result = Math.round(Math.pow(tierSum * 2, 1.4));
    if (perk) result = Math.max(0, result - 2 * 60 * 60) / 2;
    return Math.min(result, 8 * 60 * 60);
}

async function runSim(playerArmy: Army, enemyArmy: Army, setRound: (r: number | undefined) => void, setResults: (results: BattleResults | undefined) => void) {
    let results: BattleResult[] = [];
    for (let i = 0; i < roundCount; i++) {
        setRound(i + 1);
        const result = oneBattle(playerArmy, enemyArmy);
        results.push(result);
    }
    setRound(undefined)
    setResults({
        results: results,
        durationInSeconds: battleTime(playerArmy, enemyArmy, false),
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
    let losses = new Map<string, number>();
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
    let pUnits = playerArmy.toUnits();
    let eUnits = enemyArmy.toUnits();
    outer:
    while (true) {
        for (let i = 0; i < phases.length; i++) {
            [pUnits, eUnits] = fightPhase(pUnits, eUnits, phases[i]);
            if (pUnits.length == 0 || eUnits.length == 0) break outer;
        }
    }
    const pCasualties = casualties(playerArmy, pUnits);
    const eCasualties = casualties(enemyArmy, eUnits);

    const winner = eUnits.length > 0 ? 'enemy' : pUnits.length > 0 ? 'player' : 'draw';
    return {
        winner: winner,
        playerCasualties: pCasualties,
        enemyCasualties: eCasualties,
    }
}