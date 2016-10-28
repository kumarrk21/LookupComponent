({
    getSObjectNames: function(cmp, evt) {
        this.showSpinner(cmp);
        var apexMethod = cmp.get('c.getSObjectNames');
        var lookupObjectAPI = cmp.get('v.lookupObjectAPI');
        var objNames = _.map(lookupObjectAPI, 'name');
        console.log('Object names is', lookupObjectAPI);
        apexMethod.setParam('sObjectAPINames', objNames);
        apexMethod.setCallback(this, function(response) {
            this.hideSpinner(cmp);
            var state = response.getState();
            if (state == 'SUCCESS') {
                var ret = JSON.parse(response.getReturnValue());
                if (ret.success) {
                    var lookupObjects = JSON.parse(ret.message);
                    cmp.set('v.lookupObjects', lookupObjects);
                    console.log('lookupObjects is', lookupObjects);
                    try {
                        cmp.set('v.lookupObject', lookupObjects[0]);
                        this.setLookUpSVG(cmp);
                    } catch (e) {
                        console.log('Exception is ', e);
                    }

                } else {
                    this.throwError("Error getting sObject Names " + response.ret.message);
                    console.log(ret.message)
                }
            } else {
                this.throwError("Error getting sObject Names " + response.getError());
                console.log(response.getError());
            }
        });
        $A.enqueueAction(apexMethod);

    },

    selectObject: function(cmp, evt) {
        //Damn locker service doesn't expose value on select. So have to get the selected option
        //var objName = cmp.find('_objSelect').getElement().value;
        var objName;
        try{
            objName = cmp.find('_objSelect').getElement().children.find(function(option){return option.selected}).value;    
        }catch(e){
            objName = cmp.find('_objSelect').getElement().value;
        }
        
        console.log('Object Name is', objName);
        var lookupObjects = cmp.get('v.lookupObjects');
        var lookupObject = _.find(lookupObjects, function(item) {
            return item.name == objName;
        })
        cmp.set('v.lookupObject', lookupObject);
        this.setLookUpSVG(cmp);
    },

    deSelectObject: function(cmp, evt, target) {
        var selectedRecords = cmp.get('v.selectedRecords');
        var newSelectedRecords = _.remove(selectedRecords, function(item) {
            return item.id == target;
        })
        cmp.set('v.selectedCnt', _.size(selectedRecords));
        cmp.set('v.selectedRecords', selectedRecords);
        //Remove the selected flag in the filtered array
        var filteredRecords = cmp.get('v.filteredRecords');
        var selectedObject = _.find(filteredRecords, function(item) {
            return item.id == target;
        })
        if (!_.isUndefined(selectedObject)) {
            selectedObject.selected = false;
            cmp.set('v.filteredRecords', filteredRecords);
        }


    },

    setLookUpSVG: function(cmp) {
        this.showSpinner(cmp);
        try {
            var objsvgPath;
            var objsvgClass;
            var lookupObject = cmp.get('v.lookupObject');
            var lookupObjectAPI = cmp.get('v.lookupObjectAPI');
            var obj = _.find(lookupObjectAPI, function(item) {
                return item.name == lookupObject.name;
            });

            if (_.isNil(obj.svgPath)) obj.svgPath = '/resource/OrgResources/lib/slds202/assets/icons/custom-sprite/svg/symbols.svg#custom5';
            if (_.isNil(obj.svgClass)) obj.svgClass = 'slds-icon slds-icon-custom-custom5 slds-icon--medium';

            //Create the comp dynamically
            var cmpData = {};
            cmpData.svgPath = obj.svgPath;
            cmpData.class = obj.svgClass;
            cmpData.size = 'medium';
            var mainHelper = this;
            $A.createComponent('c:svgIcon', cmpData, function(newComp) {
                var body = cmp.get('v.body');
                cmp.set('v.body', newComp);
                mainHelper.hideSpinner(cmp);
            });

            this.getRecentRecords(cmp);

        } catch (e) {
            console.log('Exception is ', e);
        }


    },

    getRecentRecords: function(cmp) {
        this.showSpinner(cmp);
        var apexMethod = cmp.get('c.getRecentRecords');
        var lookupObject = cmp.get('v.lookupObject');
        apexMethod.setParam('objectName', lookupObject.name);
        var lookupObjectAPI = cmp.get('v.lookupObjectAPI');
        var obj = _.find(lookupObjectAPI, function(item) {
            return item.name == lookupObject.name;
        });
        apexMethod.setParam('returnFields', obj.fieldList);
        apexMethod.setCallback(this, function(response) {
            this.hideSpinner(cmp);
            var state = response.getState();
            if (state == 'SUCCESS') {
                var ret = JSON.parse(response.getReturnValue());
                if (ret.success) {
                    var records = JSON.parse(ret.message);
                    var recentRecords = this.getDataArray(this, records);
                    cmp.set('v.recentRecords', recentRecords);
                    cmp.set('v.filteredRecords', recentRecords);
                } else {
                    this.throwError("Error getting recent records " + response.ret.message);
                    console.log(ret.message)
                }
            } else {
                this.throwError("Error getting recent records " + response.getError());
                console.log(response.getError());
            }
        });
        $A.enqueueAction(apexMethod);

    },


    getDataArray: function(ref, inRecords) {
        var outRecords = new Array();
        _.each(inRecords, function(record) {
            var item = {};
            var dataArray = new Array();
            record = _.omit(record, 'attributes');
            _.mapKeys(record, function(value, key) {
                var data = {};
                var lkey = _.lowerCase(key);
                if (lkey == 'id') {
                    item.id = value;
                } else {
                    data.key = key;
                    data.value = value;
                    dataArray = ref.getDataFlat(ref, data, dataArray);
                }
            });
            if (_.size(dataArray) > 0) {
                var filteredArray = _.pullAt(dataArray, 0);
                item.main = filteredArray[0].value;
                item.dataArray = dataArray;
            }
            outRecords.push(item);
        })
        return outRecords;
    },

    getDataFlat: function(ref, data, dataArray) {
        if (_.isObject(data.value)) {
            _.mapKeys(data.value, function(value, key) {
                var newData = {};
                newData.key = key;
                newData.value = value;
                ref.getDataFlat(ref, newData, dataArray);
            });
        } else {
            if (_.lowerCase(data.key) != 'id') dataArray.push(data);
        }
        return dataArray;

    },


    searchMore: function(cmp, evt) {
        this.showSpinner(cmp);
        var apexMethod = cmp.get('c.getSearchedRecords');
        var lookupObject = cmp.get('v.lookupObject');
        var lookupValue = cmp.get('v.lookupValue');

        apexMethod.setParam('objectName', lookupObject.name);
        apexMethod.setParam('searchString', escape(lookupValue));
        var lookupObjectAPI = cmp.get('v.lookupObjectAPI');
        var obj = _.find(lookupObjectAPI, function(item) {
            return item.name == lookupObject.name;
        });
        apexMethod.setParam('returnFields', escape(obj.fieldList));
        apexMethod.setParam('searchScope', escape(obj.searchScope));

        apexMethod.setCallback(this, function(response) {
            this.hideSpinner(cmp);
            var state = response.getState();
            if (state == 'SUCCESS') {
                var ret = JSON.parse(response.getReturnValue());
                if (ret.success) {
                    var records = JSON.parse(ret.message);
                    console.log('searched records', records)
                    var searchedRecords = this.getDataArray(this, records);
                    cmp.set('v.searchedRecords', searchedRecords);
                    cmp.set('v.filteredRecords', searchedRecords);
                } else {
                    this.throwError("Error getting searched records " + response.ret.message);
                    console.log(ret.message)
                }
            } else {
                this.throwError("Error getting searched records " + response.getError());
                console.log(response.getError());
            }
        });
        $A.enqueueAction(apexMethod);
    },

    hideSpinner: function(cmp) {
        $A.util.addClass(cmp.find("_spinner"), "slds-hide");
    },

    showSpinner: function(cmp) {
        $A.util.removeClass(cmp.find("_spinner"), "slds-hide");
    },

    throwError: function(errText) {
        throw new Error(errText);
    }
})