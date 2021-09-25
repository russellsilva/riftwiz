import Build from './Build.js';
import Spell from './Spell.js';


// Is this needed?
const indexOfCI = function (arr, q) { // case-independent indexOf
  return arr.findIndex(
    function (item) {
      return q.toLowerCase() === item.toLowerCase()
    }
  )
};

const schoolConfig = {
  "fire" : {color:'#dc1b22',letter:'f'},
  "lightning" : {color:'#fbea57',letter:'l'},
  "ice" : {color:'#4ec1f4',letter:'i'},
  "nature" : {color:'#5dad5d',letter:'n'},
  "arcane" : {color:'#f06292',letter:'a'},
  "dark" : {color:'#9c27b0',letter:'d'},
  "holy" : {color:'#f6fe8d',letter:'h'},
  "sorcery" : {color:'#e91e63',letter:'s'},
  "conjuration" : {color:'#f36c60',letter:'c'},
  "enchantment" : {color:'#31a490',letter:'e'},
  "word" : {color:'#ffd54f',letter:'w'},
  "orb" : {color:'#f8a8b7',letter:'b'},
  "dragon" : {color:'#b0120a',letter:'r'},
  "translocation" : {color:'#ba68c8',letter:'t'},
  "eye" : {color:'#ffffff',letter:'y'},
  "chaos" : {color:'#ffab4d',letter:'o'},
}

const url = "/data_sources/"//"https://carlank.github.io/riftwiz/data_sources/";

// Create and inject the letter highlighting css

let css = '';
const head = document.head || document.getElementsByTagName('head')[0];
const style = document.createElement('style');
head.appendChild(style);
style.type = 'text/css';

for (const k in schoolConfig) {
  css += '.school_name.' + k + ' .letter{color:' + schoolConfig[k].color + "}\r\n";
  css += '.school_name.' + k + '.selected{color:' + schoolConfig[k].color + "}\r\n";
};

css += '.school_name.no-conjuration .letter{color:' + schoolConfig['conjuration'].color + "}\r\n";
css += '.school_name.conjuration-only .letter{color:' + schoolConfig['conjuration'].color + "}\r\n";

if (style.styleSheet){
  style.styleSheet.cssText = css;
} else {
  style.appendChild(document.createTextNode(css));
}

// Initialization function for the data source files

function init (jsons) {

  const levelLocaleCompare = (a,b) => a.level - b.level || a.title.localeCompare(b.title)

  jsons.spells.sort(levelLocaleCompare)
  jsons.skills.sort(levelLocaleCompare)
  jsons.shrines.sort((a,b) => a.title.localeCompare(b.title))

  new Vue({ // TODO(?): move vue part into a separate file
    el:"#app",
    data: {
      skills:jsons.skills,
      spells:jsons.spells,
      shrines:jsons.shrines,

      schools:schoolConfig,

      hovered_item: null,
      hovered_item_type: null,
      hovered_upgrade:null,

      selected_item: null,
      selected_item_type:null,

      build: new Build(),

      school_filters: [],
    },
    mounted: function(){
      const _t=this;
      window.addEventListener('keydown', function(e) {
        _t.key_pressed(e);
      });

    },
    methods:{
      sort_all () {
        this.spells.sort((a,b)=> (this.build.has('spell',b) - this.build.has('spell',a)) || levelLocaleCompare(a,b))
        this.skills.sort((a,b)=> (this.build.has('skill',b) - this.build.has('skill',a)) || levelLocaleCompare(a,b))
      },
      decorate_school_name (name, letter_only) {
        name = name.toLowerCase();
        const tmp_name = name;

        if ((name=='no-conjuration' || name=='conjuration-only')) {
          name = 'conjuration';
        }

        const school_data = this.schools[name];
        if (!school_data) {
          return 'unknown school';
        }
        const ind = name.indexOf(school_data.letter);

        let res = name.split('');
        if (!letter_only) {
          res.splice(ind+1, 0, "</span>");
          res.splice(ind, 0, "<span class='letter'>");
          res = res.join('');
        } else {
          res = "<span class='letter'>" + res[ind] + "</span>";
        }

        return res;
      },
      toggle_school (e,name){
        if (typeof this.schools[name].selected == 'undefined') {
          Vue.set(this.schools[name],'selected',false);
        }

        this.schools[name].selected = !this.schools[name].selected;
      },
      key_pressed (e){
        const K = e.key;
        if (e.ctrlKey) return; // ignore ctrl+ shortcuts 

        for (name in this.schools) {
          if (this.schools[name].letter.toLowerCase() == K.toLowerCase()){
            this.toggle_school(e,name)
          }
        }
      },
      hover_over(item,type){
        this.hovered_item = item;
        this.hovered_item_type = type;
      },
      hover_upgrade(upg){
        this.hovered_upgrade = upg;
      },
      hover_upgrade_out(){
        this.hovered_upgrade = null;
      },
      hover_out(){
        this.hovered_item = null;
        this.hovered_item_type = null;
      },
      toggle_upgrade_build(upgrade){
        if (this.build.has('spell',this.selected_item)){
          this.build.spells.get(this.selected_item.title).toggleUpgrade(upgrade);
        }
        console.log(this.selected_item,this.build.spells.get(this.selected_item.title))
      },
      toggle_item_build(item,type){
        if (this.build.has(type,item)){
          this.build.remove(type,item);
        } else {
          this.build.add(type,item)
        }
      },
      toggle_item_select(item,type){
        if (this.selected_item == item) {
          this.selected_item = null;
          this.selected_item_type = null;
        } else {
          this.selected_item = item;
          this.selected_item_type = type;
        }
        console.log(this.build)
      },
      check_against_filters(){ // TODO:rework this stuff
        const _t=this;
        return {
          'spell':function(spell_data){
            for (const k in _t.schools){
              if (_t.schools[k].selected && indexOfCI(spell_data.schools,k)===-1){
                return false;
              }
            }
            return true;
          },
          'skill':function(skill_data){
            for (const k in _t.schools){
              if (_t.schools[k].selected && indexOfCI(skill_data.schools,k)===-1){
                return false;
              }
            }
            return true;
          },
          'shrine':function(shrine_data){ // shrines conditions are || between eachother, then && if the "cj-only"/"non-cj" is present
            if (_t.selected_item && _t.selected_item_type == 'spell' && shrine_data.conditions.length) {
              const spell_schools = _t.selected_item.schools;

              if (indexOfCI(shrine_data.conditions,'conjuration-only')!==-1) {
                if (indexOfCI(spell_schools,'conjuration')===-1) {
                  return false;
                } else if (shrine_data.conditions.length==1) { // for cases with "cj-only" being the only requirement
                  return true;
                }
              }

              if (indexOfCI(shrine_data.conditions,'no-conjuration')!==-1) {
                if (indexOfCI(spell_schools,'conjuration')!==-1) {
                  return false;
                }
              }
              for (const school of spell_schools){
                if (indexOfCI(shrine_data.conditions,school)!==-1)
                  return true;
              }

              return false;
            }

            return true;
          }
        }
      }
    },
    computed: { // TODO(?): separate these: make more than one selectable, make more than one type selectable (as a feature to have some other filtering options)- decide on how will it look and what will this multi-selection do
      displayed_item: function() {
        return null || this.hovered_item || this.selected_item;
      },
      displayed_item_type: function() {
        return null || this.hovered_item_type || this.selected_item_type;
      },

    },
  });
};


Promise.all([ // bye-bye IE11;
  fetch(url + 'skills.json').then(response => response.json()),
  fetch(url + 'shrines.json').then(response => response.json()),
  fetch(url + 'spells.json').then(response => response.json()),
]).then(([skills, shrines,spells]) => init({skills:skills, shrines:shrines,spells:spells}));
