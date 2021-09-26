export default class Item {
  constructor(base){
    this.title = base.title;
    this.schools = base.schools; // shallow copy but tags never change
    this._description = base.description || "No description given";
    this.level = +base.level;
    this.active = false;
  }

  get description(){
    // oh god eval why have I done this
    return this._description.replace(/\{(.*?)\}/g,(_,p1) => eval(p1))
  }

}
