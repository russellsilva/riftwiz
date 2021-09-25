export default class Build {
  constructor(){
    this.name = '';
    this.spells = new Map();
    this.skills = new Map();
  }
  
  get items() {
    return new Map([...this.spells,...this.skills]);
  }

  has(type, item){
    switch(type){
      case 'spell':
        return this.spells.has(item.title);
      case 'skill':
        return this.skills.has(item.title);
    }
    return false;
  }

  add(type, item){
    switch(type){
      case 'spell':
        this.spells.set(item.title,item);
        break;
      case 'skill':
        this.skills.set(item.title,item);
        break;
    }
  }

  remove(type, item){
    switch(type){
      case 'spell':
        this.spells.delete(item.title);
        break;
      case 'skill':
        this.skills.delete(item.title);
        break;
    }
  }

}
