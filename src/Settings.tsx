import { useEffect, useState } from "react"

export { }

export type Settings = {
    berserkCustodian: boolean
    generalCustodian: boolean
}

function defaultSettings(): Settings {
    return {
        berserkCustodian: false,
        generalCustodian: false,
    }
}

function saveSettings(settings: Settings) {
    const j = JSON.stringify(settings)
    localStorage.setItem('settings', j);
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
            props.setSettings({ ...props.settings, ...f() })
        };
    }

    return <div className="settings">
        <div><input type="checkbox" checked={props.settings.berserkCustodian} onClick={update(() => ({ berserkCustodian: !props.settings.berserkCustodian }))} />Custodian: Berserk</div>
        <div><input type="checkbox" checked={props.settings.generalCustodian} onClick={update(() => ({ generalCustodian: !props.settings.generalCustodian }))} />Custodian: General</div>
    </div>
}