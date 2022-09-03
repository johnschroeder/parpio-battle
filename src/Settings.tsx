import { ChangeEvent, useEffect, useState } from "react"

export { }

export type Settings = {
    berserkCustodian: boolean
    generalCustodian: boolean
    islandSize?: number
}

function defaultSettings(): Settings {
    return {
        berserkCustodian: false,
        generalCustodian: false,
        islandSize: undefined,
    }
}

export function useSettings(): [Settings, (settings: Settings) => void] {
    const [settings, setSettings] = useState<Settings>(() => {
        const j = localStorage.getItem('settings');
        if (j == null) {
            return defaultSettings();
        } else {
            return JSON.parse(j);
        }
    });
    useEffect(() => {
        localStorage.setItem('settings', JSON.stringify(settings));
    }, [settings])

    return [settings, setSettings];
}

export function SettingsConfig(props: { settings: Settings, setSettings: (settings: Settings) => void }) {
    function update(f: () => Partial<Settings>) {
        return () => {
            debugger;
            const s = f();
            const newSettings = { ...props.settings, ...f() }
            console.log(`setting settings to ${JSON.stringify(newSettings)}`);
            props.setSettings({ ...props.settings, ...f() })
        };
    }

    function islandSizeOnChange(e: ChangeEvent<HTMLInputElement>) {
        try {
            let newSize: number | undefined = parseInt(e.currentTarget.value);
            if (isNaN(newSize)) {
                newSize = undefined;
            }
            update(() => ({ islandSize: newSize }))()
        } catch (err) {
            update(() => ({ islandSize: undefined }))()
        }
    }

    return <div className="settings">
        <div><input type="checkbox" checked={props.settings.berserkCustodian} onClick={update(() => ({ berserkCustodian: !props.settings.berserkCustodian }))} />Custodian: Berserk</div>
        <div><input type="checkbox" checked={props.settings.generalCustodian} onClick={update(() => ({ generalCustodian: !props.settings.generalCustodian }))} />Custodian: General</div>
        <div><input type="text" className="settingsTextInput" inputMode="numeric" value={props.settings.islandSize ?? ""} onChange={islandSizeOnChange} onClick={(e) => e.currentTarget.select()} />Island Size</div>
    </div>
}