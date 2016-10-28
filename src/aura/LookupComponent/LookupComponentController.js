({
    doInit: function(cmp, evt, helper) {
        //Default values
        var lookupObjectAPI = cmp.get('v.lookupObjectAPI');
        if (_.isEmpty(lookupObjectAPI)) {
            lookupObjectAPI = new Array();
            var obj = {}
            obj.name = 'Account';
            obj.fieldList = 'Id, Name,Industry,CleanStatus';
            obj.searchScope = 'NAME FIELDS';
            obj.svgPath = '/resource/OrgResources/lib/slds202/assets/icons/standard-sprite/svg/symbols.svg#account';
            obj.svgClass = 'slds-icon slds-icon-standard-account slds-icon--medium';
            lookupObjectAPI.push(obj);
            cmp.set('v.lookupObjectAPI', lookupObjectAPI);
        }
        cmp.set('v.selectedRecords', new Array());
        var multiSelect = cmp.get('v.multiSelect');
        if (multiSelect) {
            $A.util.addClass(cmp.find("_tab"), "slds-tabs--scoped");
            $A.util.addClass(cmp.find("_tabFilterItem"), "slds-tabs--scoped__content");
        }
        helper.getSObjectNames(cmp, evt);
    },

    selectObject: function(cmp, evt, helper) {
        helper.selectObject(cmp, evt);
    },

    searchMore: function(cmp, evt, helper) {
        helper.searchMore(cmp, evt);
    },

    filterList: function(cmp, evt, helper) {
        var lookupValue = cmp.get('v.lookupValue')
        var recentRecords = cmp.get('v.recentRecords');
        var filteredRecords = _.filter(recentRecords, function(item) {
            return (item.main.toLowerCase().indexOf(lookupValue.toLowerCase()) > -1);
        })
        cmp.set('v.filteredRecords', filteredRecords);
        if (_.size(lookupValue) > 1) {
            $A.util.removeClass(cmp.find("_searchButton"), "slds-hide");
        } else {
            $A.util.addClass(cmp.find("_searchButton"), "slds-hide");
        }
        if (_.size(lookupValue) < 1) {
            cmp.set('v.filteredRecords', cmp.get('v.recentRecords'));
        }

    },

    selectRecord: function(cmp, evt, helper) {
        var target;
        if (evt.getSource) {
            target = evt.getSource();
        } else {
            target = evt.target.id;
        }
        var filteredRecords = cmp.get('v.filteredRecords');
        var selectedObject = _.find(filteredRecords, function(item) {
            return item.id == target;
        })
        console.log('selected object is ', selectedObject);
        if (selectedObject.selected) {
            selectedObject.selected = false;
        } else {
            selectedObject.selected = true;
        }

        var lookupObject = cmp.get('v.lookupObject');
        var lookupObjectAPI = cmp.get('v.lookupObjectAPI');
        var obj = _.find(lookupObjectAPI, function(item) {
            return item.name == lookupObject.name;
        });
        selectedObject.lookupObject = obj;
        cmp.set('v.filteredRecords', filteredRecords);
        var multiSelect = cmp.get('v.multiSelect');
        var selectedRecords = cmp.get('v.selectedRecords');
        if (multiSelect) {

            if (selectedObject.selected) {
                //Check if this record is already available in the selected list
                var avlRecord = _.find(selectedRecords, function(item) {
                    return item.id == selectedObject.id;
                })
                if (_.isUndefined(avlRecord)) {
                    selectedRecords.push(selectedObject);
                    cmp.set('v.selectedRecords', selectedRecords);
                    cmp.set('v.selectedCnt', _.size(selectedRecords));
                }
            } else {
                helper.deSelectObject(cmp, evt, selectedObject.id);
            }

        } else {
            var lookupCmpEvents = $A.get("e.c:LookupCmpEvents");
            lookupCmpEvents.setParams({
                "source": cmp.get('v.source'),
                "selectedObject": selectedObject
            })
            lookupCmpEvents.fire();
        }

    },

    submit: function(cmp, evt, helper) {
        //Only triggered when multiselect is switched anyway
        var selectedRecords = cmp.get('v.selectedRecords');
        console.log('Selected records is ', selectedRecords);
        var lookupCmpEvents = $A.get("e.c:LookupCmpEvents");
        lookupCmpEvents.setParams({
            "source": cmp.get('v.source'),
            "selectedObject": selectedRecords
        })
        lookupCmpEvents.fire();
    },

    cancel: function(cmp, evt, helper) {
        var lookupCmpEvents = $A.get("e.c:LookupCmpEvents");
        lookupCmpEvents.setParams({
            "source": cmp.get('v.source'),
            "selectedObject": null
        })
        lookupCmpEvents.fire();
    },

    deSelectRecord: function(cmp, evt, helper) {
        var target;
        if (evt.getSource) {
            target = evt.getSource();
        } else {
            target = evt.target.id;
        }
        helper.deSelectObject(cmp, evt, target);

    },

    showFilterTab: function(cmp, evt, helper) {
        $A.util.removeClass(cmp.find("_tabSelected"), "slds-active");
        $A.util.addClass(cmp.find("_tabFilter"), "slds-active");
        $A.util.removeClass(cmp.find("_tabFilterItem"), "slds-hide");
        $A.util.addClass(cmp.find("_tabSelectedItem"), "slds-hide");
    },

    showSelectedTab: function(cmp, evt, helper) {
        $A.util.addClass(cmp.find("_tabSelected"), "slds-active");
        $A.util.removeClass(cmp.find("_tabFilter"), "slds-active");
        $A.util.addClass(cmp.find("_tabFilterItem"), "slds-hide");
        $A.util.removeClass(cmp.find("_tabSelectedItem"), "slds-hide");
    }

})