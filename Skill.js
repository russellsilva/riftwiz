import Item from './Item.js';
export default class Skill extends Item{
  constructor(base){
    super(base);
    this.applies_to = base.applies_to;
    this.applies_what = base.applies_what;
  }

  get cost(){
    return this.level;
  }
}
