/* 
 
 Automenu
 
*/

import * as autoformdata from './autoformdata.js';
import * as autolang from './autolang.js';
import * as autoform from './autoform.js';

// ====== module start =========
  
// convenient shorthands

var ce = React.createElement; 
var trans = autolang.trans; 
var fldtrans = autolang.fldtrans;   
  
// ===== react components ============   

  

class AutoSimpleMenu extends React.Component{  
  //displayName: 'AutoSimpleMenu',
   handleButton(menuitem,e) {
    e.preventDefault();
    var params={"action": "simplemenuselect", simplemenuselectname:menuitem};   
    this.props.callback(params);
  }
  
  render() { 
    var viewdef=this.props.viewdef;
    var menuitems=['users','tabbed users','locations','checkins','sessions'];  
    if (!menuitems) return "";     
    var menuitem,menulabel,menuclass;
    var menuBlocks = [];
    for (var i=0; i<menuitems.length; i++) {
      menuitem=menuitems[i];
      menulabel=menuitem;
      menuclass="autoleftmenubutton";
      if (this.props.simplemenuselectname) {
        if (this.props.simplemenuselectname==menuitem) menuclass+=" autoleftmenubuttonSelected";
      } else if (i==0) menuclass+=" autoleftmenubuttonSelected";                 
      if (menuitem=='Server' || menuitem=='Logs' || menuitem=='Data') {
        menuclass="autoleftmenuseparator";
        menuBlocks.push(
          ce("li", {key:i+menulabel, className: menuclass}, menulabel)
        );    
      } else {
        menuBlocks.push(
          ce("li", {key:i+menulabel, 
                        className: menuclass,
                        onClick:this.handleButton.bind
                          (this,menuitem)}, 
            ce("a", {href: "#", className: "autoleftmenubuttonlink"},
                menulabel)
          )
        );    
      }
    }
    return (
      ce("div",{},
        ce("ul",{className:"autoleftmenu"},
          menuBlocks
        )      
      )  
    );     
  }
};  


class AutoLeftMenu extends React.Component{  
  //displayName: 'AutoLeftMenu',
  handleButton(name,viewmenu,restriction,component,menuselectname,e) {
    var usedata;
    e.preventDefault();
    var params={"action": "menuselect", viewname:name, viewmenu:viewmenu, 
                component:component, menuselectname:menuselectname};
    var filter;
    if (this.props.parent && this.props.parent.data && _.isObject(this.props.parent.data))
      usedata=this.props.parent.data;
    else 
      usedata=this.props.data;
    filter=autoformdata.makeFilterFromRestriction(restriction,usedata); 
    params["filter"]=filter;
    params["parent"]=this.props.parent;
    this.props.callback(params);
  }
  
  render() {    
    var viewdef=this.props.viewdef;
    var groups=viewdef["menu"];
    if (!groups) return "";
    if (this.props.op==="list") return ce("span",{},"");     
    var group,grouplabel,menuclass;
    var groupBlocks = [];
    for (var i=0; i<groups.length; i++) {
      group=groups[i];
      grouplabel=autoform.fieldLabel(group);
      menuclass="autoleftmenubutton";
      if (this.props.menuselectname) {
        if (this.props.menuselectname==group["name"]) menuclass+=" autoleftmenubuttonSelected";
      } else if (i==0) menuclass+=" autoleftmenubuttonSelected";                 
      groupBlocks.push(
        ce("li", {key:i+group["name"], 
                      className: menuclass,
                      onClick:this.handleButton.bind
                        (this,group["viewname"],group["viewmenu"],group["restriction"],
                         group["component"],group["name"])}, 
          ce("a", {href: "#", className: "autoleftmenubuttonlink"},
              grouplabel)
        )
      );    
    }
    return (
      ce("ul",{className:"autoleftmenu"},
        groupBlocks
      )      
    );     
  }
};


// ====== exported functions =========

export {
  AutoSimpleMenu,
  AutoLeftMenu
}  