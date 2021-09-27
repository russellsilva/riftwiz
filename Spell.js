import Item from './Item.js';
import { damageTypes } from './constants.js';

export default class Spell extends Item{
  constructor(base){
    super(base);
    this._charges = +base.charges;
    this._damage = base.damage || {};
    this._radius = base.radius || 0;
    this._range = base.range || 0;
    this.upgrades = base.upgrades;//new Map();
    this.activeUpgrades = new Map();
    this.shrine = null;
  }

  get cost(){
    return this.level + [...this.activeUpgrades.values()].reduce((acc,up)=>+up.cost+acc,0);
  }

  get charges(){
    return this._charges + [...this.activeUpgrades.values()].reduce((acc,up)=>(+up?.charges || 0)+acc,0);
  }

  get damage(){
    const finalDamage = {}
    // adds damage from each upgrade and also adds 'all' damageType
    for(const type of damageTypes){
      debugger
      finalDamage[type] = this._damage[type] + [...this.activeUpgrades.values()].reduce((acc,up)=>(up?.damage?.[type] || 0)+(up?.damage?.all || 0)+acc,0);
    }
    return finalDamage;
  }

  get range(){
    return this._range + [...this.activeUpgrades.values()].reduce((acc,up)=>(+up?.range || 0)+acc,0);
  }

  get radius(){
    return this._radius + [...this.activeUpgrades.values()].reduce((acc,up)=>(+up?.radius || 0)+acc,0);
  }

  toggleUpgrade(upgrade){
    if(this.active){
      if(this.activeUpgrades.has(upgrade.title)){
        this.activeUpgrades.delete(upgrade.title);
      } else {
        this.activeUpgrades.set(upgrade.title,upgrade);
      }
    }
  }

  clearUpgrades(){
    this.activeUpgrades.clear()
  }

}
