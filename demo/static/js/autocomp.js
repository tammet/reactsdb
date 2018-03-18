/**
 * Custom components
 */

(function(exports) {
"use strict";

  var ce = React.createElement;

  /**
   * React component for displaying ISKE security level field, calculated automatically from other ISKE fields.
   *
   */
  var IskeSecurityLevelWidget = React.createClass({
    displayName: 'IskeSecurityLevelWidget',
    /*
    propTypes: {
      field: React.PropTypes.object.isRequired,   // Field object
      datarow: React.PropTypes.object.isRequired,  // Data record
      filtertype: React.PropTypes.string,
      parentName: React.PropTypes.string,
      arrayIndex: React.PropTypes.number
    },
    */
    calcSecurityLevel: function() {
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
    },

    render: function() {
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
          autoreact.fieldValue(securityLevel,this.props.field),
          ce("input", properties))
      );
    }
  });

  exports.IskeSecurityLevelWidget = IskeSecurityLevelWidget;

})(typeof exports === 'undefined'? this.autocomp = {} : exports);
