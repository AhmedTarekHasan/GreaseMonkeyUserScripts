// ==UserScript==
// @name        	LinkedInGroupInvitationsCheckboxesSelector
// @namespace     	DevelopmentSimplyPut(developmentsimplyput.blogspot.com)
// @description		Selects checkboxes on LinkedIn group invitation page
// @include     	*https://www.linkedin.com/manageGroup?dispAddMbrs*
// @version     	1
// ==/UserScript==

$(document).ready(function(){
	function PageArray(array, pageSize, pageIndex) {
		var resultToken = null;
		
		if(typeof(pageSize) != 'undefined' && null != pageSize) {
			if(pageSize <= 0) {
				pageSize = array.length;
			}
			
			var maxNumberOfPages = Math.max(1, Math.ceil(parseFloat(parseFloat(array.length) / parseFloat(pageSize))));
			
			if(typeof(pageIndex) != 'undefined' && null != pageIndex) {
				if(pageIndex < 0) {
					pageIndex = 0;
				}
				else if(pageIndex > maxNumberOfPages - 1) {
					pageIndex = maxNumberOfPages - 1;
				}
				
				var firstItemIndex = pageIndex * pageSize;
				var lastItemIndex = (pageIndex * pageSize) + (pageSize - 1);
				var actualNumberOfPages = maxNumberOfPages;
				var actualTotalNumberOfRows = array.length;
				var actualCurrentPageNumber = pageIndex + 1;
				
				if(lastItemIndex > array.length - 1) {
					lastItemIndex = array.length - 1;
				}
				
				var actualCurrentPageRowsCount = lastItemIndex - firstItemIndex + 1;
				
				resultToken = new Object();
				resultToken.Items = array.slice(firstItemIndex, lastItemIndex + 1);
				resultToken.ActualNumberOfPages = actualNumberOfPages;
				resultToken.ActualTotalNumberOfRows = actualTotalNumberOfRows;
				resultToken.ActualCurrentPageNumber = actualCurrentPageNumber;
				resultToken.ActualCurrentPageRowsCount = actualCurrentPageRowsCount;
			}
			else {
				resultToken = new Object();
				resultToken.Items = array;
				resultToken.ActualNumberOfPages = maxNumberOfPages;
				resultToken.ActualTotalNumberOfRows = array.length;
				resultToken.ActualCurrentPageNumber = 0;
				resultToken.ActualCurrentPageRowsCount = array.length;
			}
		}
		
		return resultToken;
	};
	
	var button = $("<input name='SelectCheckboxesGroup' class='btn-action' type='button' value='Select Checkboxes Group' />");
	$("div.refine").prepend("<br/><br/>");
	$("div.refine").prepend(button);
	
	$(button).click(function() {
		var checkboxes = $("input[type=checkbox][name=connectionChooser]").toArray();
		var actualNumberOfPages = PageArray(checkboxes, 50).ActualNumberOfPages;
		
		var groupIndex = prompt("Total number of groups is " + actualNumberOfPages + ". Zero-index ranges from 0 to " + (actualNumberOfPages - 1) + ". Please enter checkboxes group zero-index.", "0");

		if (groupIndex != null) {
			var checkboxesToSelect = PageArray(checkboxes, 50, groupIndex);
		
			if(typeof(checkboxesToSelect) != "undefined" && null != checkboxesToSelect && checkboxesToSelect.Items.length > 0) {
				$(checkboxesToSelect.Items).each(function(index){
					$(this).click();
				});
			}
		}
	});
});