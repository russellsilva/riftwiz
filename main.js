var indexOfCI = function (arr, q) {// case-independent indexOf
  return arr.findIndex( 
    function (item) {
      return q.toLowerCase() === item.toLowerCase()
    }
  )
};

var known_schools_stuff = {
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

var url = "/data_sources/";
url = "https://carlank.github.io/riftwiz/data_sources/";


var css = '', /* letter highlighting css */
head = document.head || document.getElementsByTagName('head')[0],
style = document.createElement('style');
head.appendChild(style);
style.type = 'text/css';

for (k in known_schools_stuff) {
  css += '.school_name.' + k + ' .letter{color:' + known_schools_stuff[k].color + "}\r\n";
  css += '.school_name.' + k + '.selected{color:' + known_schools_stuff[k].color + "}\r\n";
};

css += '.school_name.no-conjuration .letter{color:' + known_schools_stuff['conjuration'].color + "}\r\n";
css += '.school_name.conjuration-only .letter{color:' + known_schools_stuff['conjuration'].color + "}\r\n";

if (style.styleSheet){
  style.styleSheet.cssText = css;
} else {
  style.appendChild(document.createTextNode(css));
}



function init (jsons) {

  jsons.spells.sort(function(a, b) {
    if (a.level > b.level) return 1;
    if (a.level < b.level) return -1;
    if (a.title > b.title) return 1;
    if (a.title < b.title) return -1;
    return 0;
  });
  jsons.skills.sort(function(a, b) {
    if (a.level > b.level) return 1;
    if (a.level < b.level) return -1;
    if (a.title > b.title) return 1;
    if (a.title < b.title) return -1;
    return 0;
  });
  jsons.shrines.sort(function(a, b) {
    if (a.title > b.title) return 1;
    if (a.title < b.title) return -1;    
    return 0;
  });


  new Vue({ // TODO(?): move vue part into a separate file
    el:"#app",
    data: {
      skills:jsons.skills,
      spells:jsons.spells,
      shrines:jsons.shrines,

      schools:window.known_schools_stuff,

      hovered_item: null,
      hovered_item_type: null,
      hovered_upgrade:null,

      selected_item: null,
      selected_item_type:null,

      school_filters: [],
    },
    mounted: function(){
      var _t=this;
      window.addEventListener('keydown', function(e) {
        _t.key_pressed(e);
      });

    },
    methods:{
      decorate_school_name (name,letter_only) {
        var name = name.toLowerCase();
        var tmp_name = name;

        if ((name=='no-conjuration' || name=='conjuration-only')) {
          name = 'conjuration';
        }

        var school_data = this.schools[name];
        if (!school_data) {
          return 'unknown school';
        }
        var ind = name.indexOf(school_data.letter);

        var res = name.split('');
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
        var K = e.key;
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
        var _t=this;
        return {
          'spell':function(spell_data){
            for (k in _t.schools){
              if (_t.schools[k].selected && indexOfCI(spell_data.schools,k)===-1){
                return false;
              }
            }
            return true;
          },
          'skill':function(skill_data){
            for (k in _t.schools){
              if (_t.schools[k].selected && indexOfCI(skill_data.schools,k)===-1){
                return false;
              }
            }
            return true;
          },
          'shrine':function(shrine_data){ // shrines conditions are || between eachother, then && if the "cj-only"/"non-cj" is present
            if (_t.selected_item && _t.selected_item_type == 'spell' && shrine_data.conditions.length) {
              var spell_schools = _t.selected_item.schools;

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

              for (var z = 0; z<spell_schools.length;z++){
                if (indexOfCI(shrine_data.conditions,spell_schools[z])!==-1)
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
