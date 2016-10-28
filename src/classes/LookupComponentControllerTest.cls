@isTest
private class LookupComponentControllerTest {
	
	@isTest static void test_method_one() {
		LookupComponentController lc = new LookupComponentController();
		List<String> sObjectAPINames = new List<String>();
		sObjectAPINames.add('Account');
		String sObjectNames = LookupComponentController.getSObjectNames(sObjectAPINames);	
		String recentRecords = LookupComponentController.getRecentRecords('Account', 'Id,Name');	
		String searchRecords = LookupComponentController.getSearchedRecords('Account', 'ALL FIELDS','Id,Name','AB');	
		System.assert(searchRecords!=null,'Accounts Available');	
	}
	
	
}