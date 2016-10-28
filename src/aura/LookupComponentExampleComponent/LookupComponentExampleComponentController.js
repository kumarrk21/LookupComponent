({
	
	doInit : function(cmp, evt, helper) {
		//Account Lookup
		var lookupObjectAPI = new Array();
		var obj = {}
		obj.name = 'Account';
        obj.fieldList = 'Id, Name, Industry';
        obj.searchScope = 'NAME FIELDS';
        obj.svgPath = '/resource/OrgResources/lib/slds202/assets/icons/standard-sprite/svg/symbols.svg#account';
        obj.svgClass = 'slds-icon slds-icon-standard-account slds-icon--medium';
        lookupObjectAPI.push(obj);
        //Opportunity Lookup
        obj = {}
        obj.name = 'Opportunity';
        obj.fieldList = 'Id, Name, Description';
        obj.searchScope = 'NAME FIELDS'
        obj.svgPath = '/resource/OrgResources/lib/slds202/assets/icons/standard-sprite/svg/symbols.svg#opportunity';
        obj.svgClass = 'slds-icon slds-icon-standard-opportunity slds-icon--medium';
        lookupObjectAPI.push(obj);
        cmp.set('v.multiObjectSingleSelect',lookupObjectAPI);

        //User Object
        lookupObjectAPI = new Array();
        var obj = {}
        obj.name = 'User';
        obj.fieldList = 'Id, Name';
        obj.searchScope = 'NAME FIELDS';
        obj.svgPath = '/resource/OrgResources/lib/slds202/assets/icons/standard-sprite/svg/symbols.svg#user';
        obj.svgClass = 'slds-icon slds-icon-standard-user slds-icon--medium';
        lookupObjectAPI.push(obj);
        cmp.set('v.singleObjectMultiSelect',lookupObjectAPI);

	},

	handleLookupEvents: function(cmp,evt,helper){
		 var selectedObject = evt.getParam('selectedObject');
		 var source = evt.getParam('source');
		 var evtObj = cmp.get('v.evtObj');
		 cmp.set('v.selectedId', selectedObject.id);
		 cmp.set('v.selectedMain', selectedObject.main);
		 cmp.set('v.selectedLookup', JSON.stringify(selectedObject.lookupObject));
		 cmp.set('v.multiSelectObject', JSON.stringify(selectedObject));
	}
})