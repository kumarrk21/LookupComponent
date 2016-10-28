public with sharing class LookupComponentController {
	public LookupComponentController() {
		
	}


	@AuraEnabled
	public static String getSObjectNames(List<String> sObjectAPINames){
		returnMessage ret = new returnMessage();
		List<Schema.DescribeSObjectResult> dsr = Schema.describeSObjects(sObjectAPINames);
		List<objMetaData> oms = new List<objMetaData>();
		for(DescribeSObjectResult d:dsr){
			objMetaData om = new objMetaData();
			om.label = d.getLabelPlural();
			om.name = d.getName();
			oms.add(om);
		}

		ret.success = true;
		ret.message = JSON.serialize(oms);
		return(JSON.serialize(ret));
	}

	@AuraEnabled
	public static String getRecentRecords(String objectName, String returnFields){
		returnMessage ret = new returnMessage();
		List<RecentlyViewed> rvList = [Select Id, Type, LastViewedDate FROM RecentlyViewed WHERE Type =:objectName ORDER BY LastViewedDate DESC];
		Set<String> recentIds = new Set<String>();
        for(RecentlyViewed rv:rvList){
            recentIds.add(rv.Id);
        }
        returnFields = getReturnFields(returnFields);
		String q = 'SELECT ' + returnFields + ' FROM ' + objectName + ' WHERE Id in :recentIds';
		List<SObject> records = Database.query(q);
		ret.success = true;
		ret.message = JSON.serialize(records);
		return(JSON.serialize(ret));
	}

	@AuraEnabled
	public static String getSearchedRecords(String objectName, String searchScope, String returnFields, String searchString){
		returnMessage ret = new returnMessage();
		searchString = EncodingUtil.urlDecode(searchString, 'UTF-8');
		returnFields = EncodingUtil.urlDecode(returnFields, 'UTF-8');
		searchScope = EncodingUtil.urlDecode(searchScope, 'UTF-8');

		returnFields = getReturnFields(returnFields);
		String q = 'FIND \'' + searchString + '\' IN ' + searchScope + ' RETURNING ' + objectName + '(' + returnFields + ')';
		List<List<SObject>> recordsList = search.query(q);
		List<SObject> records = new List<SObject>();
		if(recordsList.size()>0){
			records = recordsList[0];
		}
		ret.success = true;
		ret.message = JSON.serialize(records);
		return(JSON.serialize(ret));
	}

	private static String getReturnFields(string returnFields){
		returnFields = returnFields.toLowerCase();
        List<String> rf = returnFields.split(',');
        Set<String> rfset = new Set<String>();
        rfset.addall(rf);
        if(!rfset.contains('id')){
        	returnFields = 'id,'+returnFields;
        }

        return returnFields;

	}

	private class objMetaData{
		public String label{get;set;}
		public String name{get;set;}
	}
	private class returnMessage{
    	public Boolean success{get;set;}
    	public String message{get;set;}
    }
}