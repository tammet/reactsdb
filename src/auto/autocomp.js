/**
 * Custom components: example
 */
 
import * as autoutils from './autoutils.js';
import * as autolist from './autolist.js';

var ce = React.createElement;

/**
 * Example react component for displaying ISKE security level field, 
 * calculated automatically from other ISKE fields.
 *
 */

class IskeSecurityLevelWidget extends React.Component{

  calcSecurityLevel() {
    var iskeClass = [];
    iskeClass[0] = this.props.datarow['iske_security_class_k'];
    iskeClass[1] = this.props.datarow['iske_security_class_t'];
    iskeClass[2] = this.props.datarow['iske_security_class_s'];
    var maxClass = -1;
    for (var i = 0; i < iskeClass.length; i++) {
      if (iskeClass[i] !== undefined && iskeClass[i] !== null && iskeClass[i] !== "") {
        var classValue = parseInt(iskeClass[i].substring(1));
        if (classValue > maxClass) maxClass = classValue;
      }
    }
    var securityLevel = '';
    switch (maxClass) {
      case -1:
        // ISKE classes not specified:
        securityLevel = '';
        break;
      case 0:
      case 1:
        securityLevel = 'L';
        break;
      case 2:
        securityLevel = 'M';
        break;
      case 3:
        securityLevel = 'H';
        break;
    }
    return securityLevel;
  }

  render() {
    var securityLevel = this.calcSecurityLevel();
    var properties = {
      type: "hidden",
      name: this.props.field.name,
      value: securityLevel,
      "data-save": 'value',
      "data-type": this.props.field.type
    };
    if (this.props.filtertype) properties["data-filter"]=this.props.filtertype;
    if (this.props.parentName) properties["data-parentname"]=this.props.parentName;
    if (this.props.arrayIndex || this.props.arrayIndex===0) properties["data-arrayindex"]=this.props.arrayIndex;
    return (
      ce("div", {},
        autoform.fieldValue(securityLevel,this.props.field),
        ce("input", properties))
    );
  }
};

  
export {
  IskeSecurityLevelWidget
}  
