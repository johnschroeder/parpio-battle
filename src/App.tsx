import React, { useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import { useArmy } from './Army';
import { Units } from './Units';
import { Battle } from './Battle';
import { SettingsConfig, useSettings } from './Settings';
import { unitInfos, validForIslandSize } from './UnitInfo';

function App() {
  const [settings, setSettings] = useSettings();
  const armyLimit = settings.generalCustodian ? 150 : 100;
  const playerArmy = useArmy(armyLimit);
  const enemyArmy = useArmy();

  useEffect(() => {
    unitInfos.forEach(u => {
      if (settings.islandSize) {
        if (!validForIslandSize(u, settings.islandSize)) {
          enemyArmy.setCount(u.name, 0);
        }
      }
    })
  }, [settings.islandSize]);

  return (
    <>
      <div style={{ display: 'flex' }}>
        <Units playerArmy={playerArmy} enemyArmy={enemyArmy} islandSize={settings.islandSize} />
        <Battle playerArmy={playerArmy} enemyArmy={enemyArmy} berserk={settings.berserkCustodian} />
      </div>
      <div>
        <SettingsConfig settings={settings} setSettings={setSettings} />
      </div>
    </>
  );
}

export default App;
