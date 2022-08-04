import ArcherIcon from './assets/png/Archer.png'
import CannoneerIcon from './assets/png/Cannoneer.png'
import CavalryIcon from './assets/png/Cavalry.png'
import CrossbowArcherIcon from './assets/png/CrossbowArcher.png'
import CuirassierIcon from './assets/png/Cuirassier.png'
import FootsoldierIcon from './assets/png/Footsoldier.png'
import KnightIcon from './assets/png/Knight.png'
import LongbowArcherIcon from './assets/png/LongbowArcher.png'
import MilitiaIcon from './assets/png/Militia.png'
import OrcArcherIcon from './assets/png/OrcArcher.png'
import OrcBoss1Icon from './assets/png/OrcBoss1.png'
import OrcBoss2Icon from './assets/png/OrcBoss2.png'
import OrcBoss3Icon from './assets/png/OrcBoss3.png'
import OrcBoss4Icon from './assets/png/OrcBoss4.png'
import OrcCannoneerIcon from './assets/png/OrcCannoneer.png'
import OrcCavalryIcon from './assets/png/OrcCavalry.png'
import OrcCrossbowArcherIcon from './assets/png/OrcCrossbowArcher.png'
import OrcCuirassierIcon from './assets/png/OrcCuirassier.png'
import OrcFootsoldierIcon from './assets/png/OrcFootsoldier.png'
import OrcKnightIcon from './assets/png/OrcKnight.png'
import OrcLongbowArcherIcon from './assets/png/OrcLongbowArcher.png'
import OrclingIcon from './assets/png/Orcling.png'


export type UnitName = string

export type UnitSkills = {
    firstStrike: boolean,
    ranged: boolean,
    flanking: boolean,
    doubleStrike: boolean,
    trample: boolean,
    lastStrike: boolean,
}

export type UnitInfo = {
    name: UnitName,
    friendly: boolean,
    maxHp: number,
    attack: number,
    crit: number,
    order: number,
    tier: number,
    skills: UnitSkills,
    icon: string,
    minIslandSize?: number,
    maxIslandSize?: number,
}

export function isBoss(u: UnitInfo): boolean {
    return u.tier >= 25;
}

function skills(s?: Partial<UnitSkills>): UnitSkills {
    return Object.assign({
        firstStrike: false,
        ranged: false,
        flanking: false,
        doubleStrike: false,
        trample: false,
        lastStrike: false,
    }, s ?? {});
}

export const unitInfos: UnitInfo[] = [
    {
        name: "Militia",
        friendly: true,
        maxHp: 15,
        attack: 5,
        crit: 0.8,
        order: 0,
        tier: 1,
        skills: skills(),
        icon: MilitiaIcon,
    },
    {
        name: "Archer",
        friendly: true,
        maxHp: 10,
        attack: 20,
        crit: 0.8,
        order: 5,
        tier: 1,
        skills: skills({ ranged: true }),
        icon: ArcherIcon,
    },
    {
        name: "Footsoldier",
        friendly: true,
        maxHp: 40,
        attack: 15,
        crit: 0.8,
        order: 1,
        tier: 1,
        skills: skills(),
        icon: FootsoldierIcon,
    },
    {
        name: "Longbow Archer",
        friendly: true,
        maxHp: 10,
        attack: 15,
        crit: 0.8,
        order: 6,
        tier: 2,
        skills: skills({ ranged: true, doubleStrike: true }),
        icon: LongbowArcherIcon,
    },
    {
        name: "Knight",
        friendly: true,
        maxHp: 90,
        attack: 20,
        crit: 0.8,
        order: 2,
        tier: 3,
        skills: skills(),
        icon: KnightIcon,
    },
    {
        name: "Crossbowman",
        friendly: true,
        maxHp: 15,
        attack: 90,
        crit: 0.8,
        order: 7,
        tier: 3,
        skills: skills({ ranged: true }),
        icon: CrossbowArcherIcon,
    },
    {
        name: "Cavalry",
        friendly: true,
        maxHp: 5,
        attack: 5,
        crit: 0.8,
        order: 4,
        tier: 2,
        skills: skills({ flanking: true, firstStrike: true }),
        icon: CavalryIcon,
    },
    {
        name: "Cuirassier",
        friendly: true,
        maxHp: 120,
        attack: 10,
        crit: 0.8,
        order: 3,
        tier: 4,
        skills: skills({ firstStrike: true }),
        icon: CuirassierIcon,
    },
    {
        name: "Cannoneer",
        friendly: true,
        maxHp: 60,
        attack: 80,
        crit: 0.8,
        order: 8,
        tier: 4,
        skills: skills({ trample: true, lastStrike: true, ranged: true, flanking: true }),
        icon: CannoneerIcon,
    },
    {
        name: "Orkling",
        friendly: false,
        maxHp: 15,
        attack: 5,
        crit: 0.6,
        order: 0,
        tier: 1,
        skills: skills(),
        icon: OrclingIcon,
        minIslandSize: 12,
        maxIslandSize: 14,
    },
    {
        name: "Orc Hunter",
        friendly: false,
        maxHp: 10,
        attack: 20,
        crit: 0.6,
        order: 5,
        tier: 1,
        skills: skills({ ranged: true }),
        icon: OrcArcherIcon,
        minIslandSize: 12,
        maxIslandSize: 20,
    },
    {
        name: "Orc Raiders",
        friendly: false,
        maxHp: 40,
        attack: 15,
        crit: 0.6,
        order: 1,
        tier: 1,
        skills: skills(),
        icon: OrcFootsoldierIcon,
        minIslandSize: 12,
        maxIslandSize: 20,
    },
    {
        name: "Elite Orc Hunters",
        friendly: false,
        maxHp: 10,
        attack: 15,
        crit: 0.6,
        order: 6,
        tier: 2,
        skills: skills({ ranged: true, doubleStrike: true }),
        icon: OrcLongbowArcherIcon,
        minIslandSize: 16,
    },
    {
        name: "Orc Veteran",
        friendly: false,
        maxHp: 90,
        attack: 20,
        crit: 0.6,
        order: 2,
        tier: 3,
        skills: skills(),
        icon: OrcKnightIcon,
        minIslandSize: 20,
    },
    {
        name: "Elite Orc Sniper",
        friendly: false,
        maxHp: 15,
        attack: 90,
        crit: 0.6,
        order: 7,
        tier: 3,
        skills: skills({ ranged: true }),
        icon: OrcCrossbowArcherIcon,
        minIslandSize: 20,
    },
    {
        name: "Warg Rider",
        friendly: false,
        maxHp: 5,
        attack: 5,
        crit: 0.6,
        order: 4,
        tier: 2,
        skills: skills({ flanking: true, firstStrike: true }),
        icon: OrcCavalryIcon,
        minIslandSize: 14,
    },
    {
        name: "Orc Vanguard",
        friendly: false,
        maxHp: 120,
        attack: 10,
        crit: 0.6,
        order: 3,
        tier: 4,
        skills: skills({ firstStrike: true }),
        icon: OrcCuirassierIcon,
        minIslandSize: 24,
    },
    {
        name: "Orc Demolisher",
        friendly: false,
        maxHp: 60,
        attack: 80,
        crit: 0.6,
        order: 8,
        tier: 4,
        skills: skills({ ranged: true, trample: true, flanking: true, lastStrike: true }),
        icon: OrcCannoneerIcon,
        minIslandSize: 24,
    },
    {
        name: "Bula (boss 1)",
        friendly: false,
        maxHp: 5000,
        attack: 150,
        crit: 0.5,
        order: 100,
        tier: 100,
        skills: skills({ trample: true, lastStrike: true }),
        icon: OrcBoss1Icon,
        minIslandSize: 12,
        maxIslandSize: 18,
    },
    {
        name: "Aguk (boss 2)",
        friendly: false,
        maxHp: 11000,
        attack: 300,
        crit: 0.5,
        order: 100,
        tier: 150,
        skills: skills({ trample: true, lastStrike: true }),
        icon: OrcBoss2Icon,
        minIslandSize: 16,
        maxIslandSize: 22,
    },
    {
        name: "Mazoga (boss 3)",
        friendly: false,
        maxHp: 120000,
        attack: 100,
        crit: 0.5,
        order: 3.5,
        tier: 200,
        skills: skills({ trample: true, lastStrike: true }),
        icon: OrcBoss3Icon,
        minIslandSize: 20,
    },
    {
        name: "Durgash (boss 4)",
        friendly: false,
        maxHp: 40000,
        attack: 500,
        crit: 0.5,
        order: 100,
        tier: 300,
        skills: skills({ trample: true, firstStrike: true }),
        icon: OrcBoss4Icon,
        minIslandSize: 20,
    },
];

var unitInfosByName: Map<string, UnitInfo> = (() => {
    var result = new Map<string, UnitInfo>();
    unitInfos.forEach(u => {
        result.set(u.name, u);
    });
    return result;
})()

export function unitInfoByName(name: string): UnitInfo {
    return unitInfosByName.get(name)!;
}

export function validForIslandSize(ui: UnitInfo, islandSize: number): boolean {
    if (islandSize < 12) return true;
    if (ui.minIslandSize && ui.minIslandSize > islandSize) return false;
    if (ui.maxIslandSize && ui.maxIslandSize < islandSize) return false;
    return true;
}