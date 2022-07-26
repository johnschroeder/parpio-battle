import React from 'react';
import logo from './logo.svg';
import './App.css';
import { useArmy } from './Army';
import { Units } from './Units';
import { Battle } from './Battle';

function App() {
  const playerArmy = useArmy(100);
  const enemyArmy = useArmy();

  return (
    <>
      <Units playerArmy={playerArmy} enemyArmy={enemyArmy} />
      <Battle playerArmy={playerArmy} enemyArmy={enemyArmy} />
    </>
  );
}

export default App;
