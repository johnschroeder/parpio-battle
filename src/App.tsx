import React from 'react';
import logo from './logo.svg';
import './App.css';
import { useArmy } from './Army';
import { Units } from './Units';
import { Battle } from './Battle';
import { SettingsConfig, useSettings } from './Settings';

function App() {
  const [settings, setSettings] = useSettings();
  const armyLimit = settings.generalCustodian ? 150 : 100;
  const playerArmy = useArmy(armyLimit);
  const enemyArmy = useArmy();

  return (
    <>
      <div style={{ display: 'flex' }}>
        <Units playerArmy={playerArmy} enemyArmy={enemyArmy} />
        <Battle playerArmy={playerArmy} enemyArmy={enemyArmy} berserk={settings.berserkCustodian} />
      </div>
      <div>
        <SettingsConfig settings={settings} setSettings={setSettings} />
      </div>
    </>
  );
}

export default App;
