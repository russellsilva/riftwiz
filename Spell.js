export default class Spell{
  constructor(base){
    this.title = base.title;
    this.schools = base.schools; // shallow copy, but schools never change
    this._level = +base.level;
    this._charges = +base.charges;
    this._damage = +base.damage;
    this._range = +base.range;
    this.upgrades = new Map();
    this.shrine = null;
  }

  get level(){
    return this._level + [...this.upgrades.values()].reduce((acc,up)=>+up.cost+acc,0);
  }

  get charges(){
    return this._charges + [...this.upgrades.values()].reduce((acc,up)=>(+up?.charges || 0)+acc,0);
  }

  get damage(){
    return this._damage + [...this.upgrades.values()].reduce((acc,up)=>(+up?.damage || 0)+acc,0);
  }

  get range(){
    return this._range + [...this.upgrades.values()].reduce((acc,up)=>(+up?.range || 0)+acc,0);
  }

  toggleUpgrade(upgrade){
    if(this.upgrades.has(upgrade.title)){
      this.upgrades.delete(upgrade.title);
    } else {
      this.upgrades.set(upgrade.title,upgrade);
    }
  }

}
