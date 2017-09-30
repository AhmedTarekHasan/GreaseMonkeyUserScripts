// ==UserScript==
// @author          Ahmed Tarek Hasan (http://linkedin.com/in/atarekhasan)
// @name        	FacebookGroupMessageCheckboxesSelector
// @namespace     	DevelopmentSimplyPut(developmentsimplyput.blogspot.com)
// @description		Selects checkboxes on Facebook group message
// @include     	*https://www.facebook.com/groups*
// @require         http://code.jquery.com/jquery-latest.min.js
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

	$(document).on('mouseover', 'div.standardLayout:not(".processed")', function(){
		var button = $("<input name='SelectCheckboxesGroup' class='_42ft _4jy0 _59x2 _4jy3 _517h _51sy' type='button' value='Select Checkboxes Group' />");
		$("div.standardLayout").prepend("<br/>");
		$("div.standardLayout").prepend(button);
		$("div.standardLayout").addClass('processed');
		
		$(button).click(function() {
			var checkboxes = $("input.checkbox[type=checkbox][name*=checkableitems]").toArray();
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
});