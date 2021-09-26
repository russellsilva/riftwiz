export default class Spell{
  constructor(base){
    this.title = base.title;
    this._description = base.description || "No description given";
    this.schools = base.schools; // shallow copy, but schools never change
    this._level = +base.level;
    this._charges = +base.charges;
    this._damage = base.damage;
    this._radius = base.radius;
    this._range = +base.range;
    this.upgrades = base.upgrades;//new Map();
    this.activeUpgrades = new Map();
    this.shrine = null;
    this.active = false;
  }

  get description(){
    // oh god eval why have I done this
    console.log(this._description)
    return this._description.replace(/\{(.*?)\}/g,(_,p1) => eval(p1))
  }

  get level(){
    return this._level + [...this.activeUpgrades.values()].reduce((acc,up)=>+up.cost+acc,0);
  }

  get charges(){
    return this._charges + [...this.activeUpgrades.values()].reduce((acc,up)=>(+up?.charges || 0)+acc,0);
  }

  get damage(){
    const finalDamage = {}
    for(const type in this._damage){
      finalDamage[type] = this._damage[type] + [...this.activeUpgrades.values()].reduce((acc,up)=>(+up?.damage?.[type] || 0)+acc,0);
    }
    return finalDamage;
  }

  get range(){
    return this._range + [...this.activeUpgrades.values()].reduce((acc,up)=>(+up?.range || 0)+acc,0);
  }

  get radius(){
    console.log(this.activeUpgrades)
    return this._radius + [...this.activeUpgrades.values()].reduce((acc,up)=>(+up?.radius || 0)+acc,0);
  }

  toggleUpgrade(upgrade){
    if(this.activeUpgrades.has(upgrade.title)){
      this.activeUpgrades.delete(upgrade.title);
    } else {
      this.activeUpgrades.set(upgrade.title,upgrade);
    }
  }

}
