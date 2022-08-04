import React from 'react';
import { Army } from './Army';
import { UnitInput } from './Unit';
import { isBoss, UnitInfo, unitInfos, validForIslandSize } from './UnitInfo';

type UnitListProps = {
    unitInfos: UnitInfo[]
    isPlayer: boolean
    army: Army
    title: string
}
function UnitList(props: UnitListProps) {
    return <div className="unitList">
        <h1>{props.title}</h1>
        <button className="config resetArmy" onClick={() => props.army.clear()}>Clear</button>
        {props.unitInfos.map(u => {
            return <UnitInput
                name={u.name}
                key={u.name}
                isBoss={isBoss(u)}
                icon={u.icon}
                isPlayer={props.isPlayer}
                count={props.army.count(u.name) || 0}
                army={props.army}
            />

        })}
    </div>
}

type UnitsProps = {
    enemyArmy: Army
    playerArmy: Army
    islandSize: number | undefined
}
export function Units(props: UnitsProps) {
    function enemyFilter(u: UnitInfo): boolean {
        if (u.friendly) return false;
        if (props.islandSize && !validForIslandSize(u, props.islandSize)) return false;
        return true;
    }

    return <div className="town">
        <UnitList unitInfos={unitInfos.filter(enemyFilter)}
            army={props.enemyArmy}
            isPlayer={false}
            title="Enemy Units" />
        <UnitList unitInfos={unitInfos.filter(u => u.friendly)}
            army={props.playerArmy}
            isPlayer={true}
            title="Player Units" />
    </div>
}