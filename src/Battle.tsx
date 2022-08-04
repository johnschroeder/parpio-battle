import { useEffect, useMemo, useState } from 'react';
import { Army } from './Army';
import { BattleLogEntry, BattleResults, CasualtyStats, runSim } from './simulator';
import { isBoss, unitInfoByName } from './UnitInfo';

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
    }, [props.playerArmy, props.enemyArmy, props.berserk, showResults])

    return <div className="battle">
        <h2>Simulation Results</h2>
        {/* <button className="run" onClick={() => runSim(props.playerArmy, props.enemyArmy, setResults)}> Attack! </button> */}
        <ResultsDisplay results={results} />
        {results && <BattleLogDisplay log={results.battleLog} />}
    </div>
}

function formatSeconds(seconds: number): string {
    let out_seconds = seconds % 60;
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    minutes = minutes % 60;
    return (hours > 0 ? hours + "h " : "") + (minutes > 0 ? minutes + "m " : "") + (out_seconds > 0 ? out_seconds + "s " : "Instant");
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
                    <img alt={t} src={unitInfoByName(t).icon} />: {decimal((cs.total.get(t) ?? 0) / cs.roundCount)}
                    {cs.min.get(t) !== cs.max.get(t) && <> ({cs.min.get(t) ?? 0} - {cs.max.get(t) ?? 0})</>}
                </li>
            )}
        </>
    </figure>
}

function formatHp(hp: number): string {
    if (hp > 1000) {
        return (hp / 1000) + 'k';
    }
    return hp + '';
}

function BattleLogDisplay(props: { log: BattleLogEntry[] }) {
    if (!props.log) {
        return null;
    }
    return <div>
        <h2>Sample Battle Log</h2>
        <table className="battleLog">
            <thead>
                <th>Stage</th>
                <th>Enemy</th>
                <th>Player</th>
            </thead>
            <tbody>
                {props.log.map(entry => <tr key={entry.stageName}>
                    <td>{entry.stageName}</td>
                    <td><div className="battleLogUnitList">{entry.enemyRemaining.map(uc => {
                        const unitInfo = unitInfoByName(uc.type);
                        return <div key={uc.type} className="battleLogUnit">
                            <div className="battleLogImageAndCount">
                                <img alt={uc.type} src={unitInfoByName(uc.type).icon} />{uc.count}
                            </div>
                            {isBoss(unitInfo) && uc.remainingHp !== undefined &&
                                <div className="bossHp">
                                    {formatHp(uc.remainingHp)}/{formatHp(unitInfo.maxHp)}
                                </div>
                            }
                        </div>
                    })}</div></td>
                    <td><div className="battleLogUnitList">{entry.playerRemaining.map(uc =>
                        <div key={uc.type} className="battleLogUnit">
                            <div className="battleLogImageAndCount">
                                <img alt={uc.type} src={unitInfoByName(uc.type).icon} />{uc.count}
                            </div>
                        </div>
                    )}</div></td>
                </tr>)}
            </tbody>
        </table>
    </div>
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