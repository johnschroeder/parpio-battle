import { Army } from "./Army";

type UnitProps = {
    name: string,
    unitImageURL: string,
    weaponImageURL: string,
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
                value={props.count}
                onClick={e => e.currentTarget.select()}
                onChange={e => props.army.setCount(props.name, parseInt(e.currentTarget.value))} />
            {props.isPlayer && <>
                <button className="config" onClick={() => props.army.setCount(props.name, props.count + 1)}>+1</button>
                <button className="config" onClick={() => props.army.setCount(props.name, props.count + 5)}>+5</button>
                <button className="config" onClick={() => props.army.fillCount(props.name)}>Fill</button>
                <button className="config" onClick={() => props.army.setAll(props.name)}>All</button>
            </>}
        </>
    }
    return <div className="unitEntry">
        <img src={props.unitImageURL} title={props.name} />
        <img src={props.weaponImageURL} />
        {input}
    </div>;
}