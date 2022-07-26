import React from 'react';
import { Army } from './Army';
import { UnitInput } from './Unit';
import { isBoss, UnitInfo, unitInfos } from './UnitInfo';

type UnitListProps = {
    unitInfos: UnitInfo[],
    army: Army
    title: string,
}
function UnitList(props: UnitListProps) {
    return <div className="unitList">
        <h1>{props.title}</h1>
        {props.unitInfos.map(u => {
            return <UnitInput
                name={u.name}
                key={u.name}
                isBoss={isBoss(u)}
                unitImageURL={u.unitImageURL}
                weaponImageURL={u.weaponImageURL}
                count={props.army.count(u.name)}
                setCount={(c) => props.army.setCount(u.name, c)}
            />

        })}
    </div>
}

type UnitsProps = {
    enemyArmy: Army
    playerArmy: Army
}
export function Units(props: UnitsProps) {
    return <div className="town">
        <UnitList unitInfos={unitInfos.filter(u => !u.friendly)}
            army={props.enemyArmy}
            title="Enemy Units" />
        <UnitList unitInfos={unitInfos.filter(u => u.friendly)}
            army={props.playerArmy}
            title="Player Units" />
    </div>
}