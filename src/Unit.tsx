type UnitProps = {
    name: string,
    unitImageURL: string,
    weaponImageURL: string,
    count: number,
    isBoss: boolean;
    setCount: (count: number) => void,
}

export function UnitInput(props: UnitProps) {
    return <div className="unitEntry">
        <img src={props.unitImageURL} title={props.name} />
        <img src={props.weaponImageURL} />
        {!props.isBoss ?
            <input type="number"
                value={props.count}
                onClick={e => e.currentTarget.select()}
                onChange={e => props.setCount(parseInt(e.currentTarget.value))} />
            :
            <input type="checkbox"
                checked={props.count > 0}
                onChange={e => props.setCount(props.count ? 0 : 1)} />
        }
    </div>;
}