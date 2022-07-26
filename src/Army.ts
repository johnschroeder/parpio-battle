import React, { useState } from 'react';
import { isBoss, UnitInfo, unitInfos } from './UnitInfo';

export type Unit = UnitInfo & { hp: number }

export class Army {
    private counts: Map<string, number>;
    private setCounts: (counts: Map<string, number>) => void;
    private limit: number | undefined;

    constructor(
        counts: Map<string, number>,
        setCounts: (counts: Map<string, number>) => void,
        limit?: number,
    ) {
        this.counts = counts;
        this.setCounts = setCounts;
        this.limit = limit;
    }

    clear() {
        this.setCounts(new Map<string, number>());
    }

    setCount(unitType: string, newCount: number) {
        if (this.count(unitType) === newCount) {
            return;
        }
        const newCounts = new Map(this.counts);

        if (this.limit && newCount > this.limit) {
            newCount = this.limit;
        }
        if (newCount <= 0) {
            newCounts.delete(unitType);
            newCount = 0;
        }

        newCounts.set(unitType, newCount);

        // if we're adding a boss, remove all other bosses
        if (newCount > 0) {
            const u = unitInfos.find(u => u.name === unitType);
            if (u && isBoss(u)) {
                unitInfos.forEach(u2 => {
                    if (isBoss(u2) && u2.name !== unitType) {
                        newCounts.set(u2.name, 0);
                    }
                })
            }
        }

        // if the new count put us over the limit, make space by
        // kicking out other units
        if (this.limit) {
            let totalCount = 0;
            newCounts.forEach(c => { totalCount += c; });
            let excess = totalCount - this.limit;
            if (excess > 0) {
                for (let i = 0; i < unitInfos.length; i++) {
                    const u = unitInfos[i];
                    if (u.name === unitType) {
                        continue;
                    }
                    const count = newCounts.get(u.name) ?? 0;
                    if (count > 0) {
                        const toRemove = Math.min(excess, count);
                        newCounts.set(u.name, count - toRemove);
                        excess -= toRemove;
                    }
                }
            }
        }

        this.setCounts(newCounts);
    }

    fillCount(unitType: string) {
        if (this.limit === undefined) {
            throw Error('fillCount called on an unlimited army');
        }
        let availableSpace = this.limit;
        this.counts.forEach((count, name) => {
            if (name !== unitType) {
                availableSpace -= count;
            }
        });
        this.setCount(unitType, availableSpace);
    }

    setAll(unitType: string) {
        if (this.limit === undefined) {
            throw Error('setAll called on an unlimited army');
        }
        this.setCounts(new Map<string, number>([[unitType, this.limit]]));
    }

    count(unitType: string): number | undefined {
        return this.counts.get(unitType);
    }

    toUnits(): Unit[] {
        let units: Unit[] = [];
        this.counts.forEach((count, name) => {
            const unit = unitInfos.find(u => u.name === name);
            if (!unit) {
                return;
            }
            for (let i = 0; i < count; i++) {
                units.push({ ...unit, hp: unit.maxHp });
            }
        })
        units.sort((a, b) => a.order - b.order);
        return units;
    };
}

export function useArmy(limit?: number): Army {
    const [counts, setCounts] = useState(new Map<string, number>());
    return new Army(counts, setCounts, limit);
}
