import { Army } from "./Army";
import { UnitName } from "./UnitInfo";

type AdjustUnitCountButtonProps = {
    adjust: () => void
}

function AdjustUnitCountButton(props: React.PropsWithChildren<AdjustUnitCountButtonProps>) {
    return <button
        className="config"
        tabIndex={-1}
        onClick={props.adjust}>
        {props.children}
    </button>
}

type UnitProps = {
    name: UnitName,
    icon: string,
    count: number,
    isBoss: boolean;
    isPlayer: boolean;
    army: Army,
}

export function UnitInput(props: UnitProps) {
    let input: React.ReactElement;
    if (props.isBoss) {
        input = <input type="checkbox"
            checked={props.count > 0}
            onChange={e => props.army.setCount(props.name, props.count ? 0 : 1)} />;
    } else {
        input = <>
            <input type="number"
                value={props.count + ''}
                onClick={e => e.currentTarget.select()}
                onChange={e => props.army.setCount(props.name, ~~(e.currentTarget.value || 0))} />
            {props.isPlayer && <>
                <AdjustUnitCountButton adjust={() => props.army.setCount(props.name, props.count + 1)}>+1</AdjustUnitCountButton>
                <AdjustUnitCountButton adjust={() => props.army.setCount(props.name, props.count + 5)}>+5</AdjustUnitCountButton>
                <AdjustUnitCountButton adjust={() => props.army.fillCount(props.name)}>Fill</AdjustUnitCountButton>
                <AdjustUnitCountButton adjust={() => props.army.setAll(props.name)}>All</AdjustUnitCountButton>
            </>}
        </>
    }
    return <div className="unitEntry">
        <img src={props.icon} title={props.name} />
        {input}
    </div>;
}