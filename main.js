import Spell from './Spell.js';
import Skill from './Skill.js';

import * as Constants from './constants.js';

// Is this needed?
const indexOfCI = function (arr, q) { // case-independent indexOf
  return arr.findIndex(
    function (item) {
      return q.toLowerCase() === item.toLowerCase()
    }
  )
};

const url = location.hostname === 'localhost' ? "/data_sources/" : "/riftwiz/data_sources/"

// Create and inject the letter highlighting css

let css = '';
const head = document.head || document.getElementsByTagName('head')[0];
const style = document.createElement('style');
head.appendChild(style);
style.type = 'text/css';

for (const k in Constants.schoolConfig) {
  css += '.school_name.' + k + ' .letter{color:' + Constants.schoolConfig[k].color + "}\r\n";
  css += '.school_name.' + k + '.selected{color:' + Constants.schoolConfig[k].color + "}\r\n";
};

css += '.school_name.no-conjuration .letter{color:' + Constants.schoolConfig['conjuration'].color + "}\r\n";
css += '.school_name.conjuration-only .letter{color:' + Constants.schoolConfig['conjuration'].color + "}\r\n";

if (style.styleSheet){
  style.styleSheet.cssText = css;
} else {
  style.appendChild(document.createTextNode(css));
}

// Initialization function for the data source files

function init (jsons) {

  const levelLocaleCompare = (a,b) => a.level - b.level || a.title.localeCompare(b.title)

  jsons.spells = jsons.spells.map(spell => new Spell(spell))
  jsons.skills = jsons.skills.map(skill => new Skill(skill))

  jsons.spells.sort(levelLocaleCompare)
  jsons.skills.sort(levelLocaleCompare)
  jsons.shrines.sort((a,b) => a.title.localeCompare(b.title))

  new Vue({ // TODO(?): move vue part into a separate file
    el:"#app",
    data: {
      skills:jsons.skills,
      spells:jsons.spells,
      shrines:jsons.shrines,

      schools:Constants.schoolConfig,

      hovered_item: null,
      hovered_item_type: null,
      hovered_upgrade:null,

      selected_item: null,
      selected_item_type:null,

      school_filters: [],

      query: '',
    },
    mounted: function(){
      const _t=this;
      window.addEventListener('keydown', function(e) {
        // _t.key_pressed(e);
      });

    },
    methods:{
      sort_all () {
        this.spells.sort((a,b)=> b.active - a.active || levelLocaleCompare(a,b))
        this.skills.sort((a,b)=> b.active - a.active || levelLocaleCompare(a,b))
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
        this.selected_item.toggleUpgrade(upgrade);
      },
      toggle_item_build(item,type){
        item.active = !item.active;
        if(!item.active){
          item.clearUpgrades()
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
