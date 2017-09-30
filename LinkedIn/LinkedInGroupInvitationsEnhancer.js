var connections = [];
var groupMembers = [];
var groupInvitedConnections = [];
var stopRetrievingConnections = false;
var stopRetrievingGroupMembers = false;
var stopRetrievingGroupInvitedConnections = false;
var currentGroupId = 0;
var csrfToken = "";

function getMyConnections() {
	detectCurrentGroupId();
	detectCSRFToken();
	
	if(currentGroupId != null && currentGroupId != '' && currentGroupId != 0 && csrfToken != null && csrfToken != '') {
		if($("#nowLoading").length <= 0) {
			var nowLoading = '';
			nowLoading +=	'<div id="nowLoading" style="width:100%;height:100%;position:fixed;z-index:9999;background:url(\'https://www.creditmutuel.fr/cmne/fr/banques/webservices/nswr/images/loading.gif\') no-repeat center center rgba(0,0,0,0.25)"></div>';
			$("body").prepend(nowLoading);
		}
		
		$("#nowLoading").show();
		$("#divSwitchToExtendedModeButton").hide();
		
		connections = [];
		groupMembers = [];
		groupInvitedConnections = [];
		stopRetrievingConnections = false;
		stopRetrievingGroupMembers = false;
		stopRetrievingGroupInvitedConnections = false;
		
		var startItemIndex = 0;
		var offset = 2000;
		
		getMyConnectionsRecursively(offset, startItemIndex);
		
		var interval = setInterval(function(){
			if(stopRetrievingConnections) {
				clearInterval(interval)
				interval = null;
				stopRetrievingConnections = false;
				
				if(connections != null && connections.length > 0) {
					connections = connections.sort(function(a, b){
						if(a.firstName < b.firstName) return -1;
						if(a.firstName > b.firstName) return 1;
						if(a.lastName < b.lastName) return -1;
						if(a.lastName > b.lastName) return 1;
						return 0;
					});
					
					//console.log(connections);
					getMyGroupMembers(currentGroupId);
				}
			}
		}, 2000);
	}
	else {
		alert('Wrong group id!!!');
	}
}

function getMyConnectionsRecursively(offset, startItemIndex) {
	var settings = {
		"async": true,
		"crossDomain": true,
		"url": "https://www.linkedin.com/voyager/api/relationships/connections?count=" + offset.toString() + "&sortType=RECENTLY_ADDED&start=" + startItemIndex.toString(),
		"method": "GET",
		"headers": {
			"accept": "application/vnd.linkedin.normalized+json",
			"accept-language": "en-US,en;q=0.8",
			"cache-control": "no-cache",
			"csrf-token": csrfToken,
			"pragma": "no-cache",
			"x-li-lang": "en_US",
			"x-li-page-instance": "urn:li:page:d_flagship3_people_connections;64dTZfULSryIawS0ww6CDg==",
			"x-li-track": "{\\\"clientVersion\\\":\\\"1.0.*\\\",\\\"osName\\\":\\\"web\\\",\\\"timezoneOffset\\\":2,\\\"deviceFormFactor\\\":\\\"DESKTOP\\\",\\\"mpName\\\":\\\"voyager-web\\\"}",
			"x-requested-with": "XMLHttpRequest",
			"x-restli-protocol-version": "2.0.0"
		}
	}

	$.ajax(settings).done(function (response) {
		if(typeof(response) != 'undefined' && response != null) {
			var count = parseInt(response.data.metadata.id);
			
			if(count > 0) {
				var ids = [];
				
				for(var i = 0; i <= response.included.length - 1; i++) {
					if(typeof(response.included[i].id) != 'undefined' && response.included[i].id != null) {
						var idItem = {};
						idItem.imageUrl = "https://media.licdn.com/mpr/mpr/shrinknp_100_100" + response.included[i].id;
						idItem.id = response.included[i].$id.replace(",picture,com.linkedin.voyager.common.MediaProcessorImage", "");
						ids.push(idItem);
					}
					else if(typeof(response.included[i].firstName) != 'undefined' && response.included[i].firstName != null) {
						var connection = {};
						
						connection.firstName = response.included[i].firstName;
						connection.lastName = response.included[i].lastName;
						connection.occupation = response.included[i].occupation;
						connection.objectUrn = response.included[i].objectUrn.replace("urn:li:member:", "");
						connection.publicIdentifier = response.included[i].publicIdentifier;
						connection.selected = false;
						connection.hidden = false;
						
						for(var k = 0; k <= ids.length - 1; k++) {
							if(response.included[i].entityUrn == ids[k].id) {
								connection.imageUrl = ids[k].imageUrl;
								connection.id = ids[k].id;
								break;
							}
						}
						
						connections.push(connection);
					}
				}
				
				startItemIndex += offset;
				getMyConnectionsRecursively(offset, startItemIndex);
			}
			else {
				stopRetrievingConnections = true;
			}
		}
	}).fail(function(jqXHR, textStatus){
		console.log(jqXHR);
		console.log(textStatus);
		$("#nowLoading").hide();
		alert("Problem has occured. Please check console for log.");
	});
}

function getMyGroupMembers() {
	var startItemIndex = 0;
	getMyGroupMembersRecursively(startItemIndex);
	
	var interval = setInterval(function(){
		if(stopRetrievingGroupMembers) {
			clearInterval(interval)
			interval = null;
			stopRetrievingGroupMembers = false;
			//console.log(groupMembers);
			
			if(connections != null && connections.length > 0) {
				connections = connections.filter(function(item){
					return (groupMembers.indexOf(item.publicIdentifier) == -1);
				});
				
				console.log(connections);
				//populateConnectionsList();
				getMyGroupInvitedConnections();
			}
		}
	}, 2000);
}

function getMyGroupMembersRecursively(startItemIndex) {
	var settings = {
		"async": true,
		"crossDomain": true,
		"url": "https://www.linkedin.com/communities-api/v1/memberships/community/" + currentGroupId.toString() + "?membershipStatus=MEMBERS&start=" + startItemIndex.toString() + "&projection=FULL&sortOrder=LAST_NAME",
		"method": "GET",
		"headers": {
			"accept": "application/json, text/javascript, */*; q=0.01",
			"csrf-token": csrfToken,
			"x-requested-with": "XMLHttpRequest",
			"accept-language": "en-US,en;q=0.8",
			"cache-control": "no-cache"
		}
	}

	$.ajax(settings).done(function (response) {
		if(typeof(response) != 'undefined' && response != null) {
			var count = response.data.length;
			
			if(count == 0) {
				stopRetrievingGroupMembers = true;
			}
			else {
				groupMembers = groupMembers.concat(response.data.map(function(item){
					return item.mini.profileUrl.replace("https://www.linkedin.com/in/", "");
				}));
				
				startItemIndex += 10;
				getMyGroupMembersRecursively(startItemIndex);
			}
		}
	}).fail(function(jqXHR, textStatus){
		console.log(jqXHR);
		console.log(textStatus);
		$("#nowLoading").hide();
		alert("Problem has occured. Please check console for log.");
	});
}

function getMyGroupInvitedConnections() {
	var startItemIndex = 0;
	getMyGroupInvitedConnectionsRecursively(startItemIndex);
	
	var interval = setInterval(function(){
		if(stopRetrievingGroupInvitedConnections) {
			clearInterval(interval)
			interval = null;
			stopRetrievingGroupInvitedConnections = false;
			//console.log(groupInvitedConnections);
			
			if(connections != null && connections.length > 0) {
				connections = connections.filter(function(item){
					return (groupInvitedConnections.indexOf(item.publicIdentifier) == -1);
				});
				
				console.log(connections);
				populateConnectionsList();
			}
		}
	}, 2000);
}

function getMyGroupInvitedConnectionsRecursively(startItemIndex) {
	var settings = {
		"async": true,
		"crossDomain": true,
		"url": "https://www.linkedin.com/communities-api/v1/memberships/community/" + currentGroupId.toString() + "?membershipStatus=INVITED&start=" + startItemIndex.toString() + "&projection=FULL&sortOrder=LAST_NAME",
		"method": "GET",
		"headers": {
			"accept": "application/json, text/javascript, */*; q=0.01",
			"csrf-token": csrfToken,
			"x-requested-with": "XMLHttpRequest",
			"accept-language": "en-US,en;q=0.8",
			"cache-control": "no-cache"
		}
	}

	$.ajax(settings).done(function (response) {
		if(typeof(response) != 'undefined' && response != null) {
			var count = response.data.length;
			
			if(count == 0) {
				stopRetrievingGroupInvitedConnections = true;
			}
			else {
				groupInvitedConnections = groupInvitedConnections.concat(response.data.map(function(item){
					return item.mini.profileUrl.replace("https://www.linkedin.com/in/", "");
				}));
				
				startItemIndex += 10;
				getMyGroupInvitedConnectionsRecursively(startItemIndex);
			}
		}
	}).fail(function(jqXHR, textStatus){
		console.log(jqXHR);
		console.log(textStatus);
		$("#nowLoading").hide();
		alert("Problem has occured. Please check console for log.");
	});
}

function populateConnectionsList() {
	if($("ul#connectionsList").length <= 0) {
		var main = '<div class="js-members-list invite-connections-view">';
		main +=			'<br/>';
		main +=			'<div style="color: red;font-size:25px;">WARNING:</div>';
		main +=			'<div style="color: red">This utility is provided only to facilitate the process of inviting your connections to your group. It was not intended by any mean to be used for spamming LinkedIn users or breaking any of LinkedIn policies. It is your own responsibility to choose the way to use this utility so please make sure to use it the right way. Do not just select all your connections and hit the invite button as this makes a spammer out of you and LinkedIn doesn\'t tolerate spammers. If you got reported by a quite number of connections you will be penalized by LinkedIn. That\'s it, you are now on your own :)</div>';
		main +=			'<br/>';
		main +=			'<h2 class="invite-header">Invite your connections&nbsp;(<span id="selectedCount">0</span>&nbsp;Selected)</h2>';
		main +=			('<input type="checkbox" class="js-select-input select-input small-input" id="selectAll" onclick="toggleSelectAll(this)">');
		main +=			'<label for="selectAll" title="Select All/None of the filtered connections below"><span class="a11y-text">Select All Connections</span></label>';
		main +=			'&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp';
		main +=			'<input type="text" name="searchConnectionsByName" id="searchConnectionsByName" class="member-input js-member-input tt-input" style="width: 300px!important;" placeholder="Filter connections by name..." autocomplete="off" spellcheck="false" dir="ltr" aria-owns="tt-behavior58" aria-expanded="false" aria-live="polite" aria-haspopup="true" aria-atomic="true" style="position: relative; vertical-align: top; background-color: transparent;">';
		main +=			'&nbsp&nbsp';
		main +=			'<input type="text" name="searchConnectionsByOccupation" id="searchConnectionsByOccupation" class="member-input js-member-input tt-input" style="width: 300px!important;" placeholder="Filter connections by occupation..." autocomplete="off" spellcheck="false" dir="ltr" aria-owns="tt-behavior58" aria-expanded="false" aria-live="polite" aria-haspopup="true" aria-atomic="true" style="position: relative; vertical-align: top; background-color: transparent;">';
		main +=			'&nbsp&nbsp';
		main += 		'<button class="js-invite-btn invite-btn" onclick="applyFiltering();">Filter</button>';
		main +=			'&nbsp&nbsp';
		main += 		'<button class="js-invite-btn invite-btn" onclick="inviteSelected();">Invite Selected</button>';
		main +=			'<br/><br/>';
		main +=			'<div class="focus-first" style="max-height: 400px; overflow-y: auto;">';
		main +=				'<ul id="connectionsList" class="manage-members-list">';
		main +=				'</ul>';
		main +=			'</div>';
		main +=		'</div>';
		
		$(main).insertAfter("div.js-invite-connections-view.invite-connections-view");
		$("div.js-invite-connections-view.invite-connections-view").hide();
		$("#nowLoading").hide();
	}
	
	var connectionItems = '';
	
	for(var i = 0; i < connections.length; i++) {
		var connection = connections[i];
		
		if(!connection.hidden) {
			connectionItems += '<li class="member-view">';
			connectionItems +=		'<div class="select-block">';
			connectionItems +=			('<input id="chk_' + i.toString() + '" type="checkbox"' + ((connection.selected) ? 'checked ' : '') + 'onclick="toggleConnectionSelection(this, ' + i.toString() + ')" class="js-select-input select-input small-input">');
			connectionItems +=			'<label for="chk_' + i.toString() +'"><span class="a11y-text">Select member</span></label>';
			connectionItems +=		'</div>';
			connectionItems +=		'<div class="member-block">';
			connectionItems +=			'<div class="member-entity">';
			connectionItems +=				('<a class="entity-container entity-link js-member-entity-link" target="_blank" href="https://www.linkedin.com/in/' + connection.publicIdentifier + '">');
			connectionItems +=					'<figure class="entity-figure">';
			connectionItems +=						('<img src="' + connection.imageUrl + '" class="entity-image member-image" alt="' + connection.firstName + ' ' + connection.lastName + '" width="100" height="100">');
			connectionItems +=					'</figure>';
			connectionItems +=					'<div class="entity-info">';
			connectionItems +=						'<p class="entity-name">';
			connectionItems +=							'<span class="js-hovercard entity-name-text">';
			connectionItems +=								(connection.firstName + ' ' + connection.lastName);
			connectionItems +=							'</span>';
			connectionItems +=						'</p>';
			connectionItems +=						'<p class="entity-headline">';
			connectionItems +=							connection.occupation;
			connectionItems +=						'</p>';
			connectionItems +=						'<p class="entity-subheading"></p>';
			connectionItems +=					'</div>';
			connectionItems +=				'</a>';
			connectionItems +=			'</div>';
			connectionItems +=		'</div>';
			connectionItems +=	'</li>';
		}
	}
	
	$("ul#connectionsList").html(connectionItems);
}

function toggleConnectionSelection(checkbox, connectionIndex) {
	if($(checkbox).is(':checked')) {
		connections[connectionIndex].selected = true;
		$("#selectedCount").html((parseInt($("#selectedCount").html()) + 1).toString());
	}
	else {
		connections[connectionIndex].selected = false;
		$("#selectedCount").html((parseInt($("#selectedCount").html()) - 1).toString());
	}
}

function toggleSelectAll(checkbox) {
	$("#nowLoading").show();
	
	setTimeout(function(){
		var selected = false;
	
		if($(checkbox).is(':checked')) {
			selected = true;
		}
		
		for(var i = 0; i < connections.length; i++) {
			var connection = connections[i];
			
			if(!connection.hidden) {
				if(connection.selected != selected) {
					if(connection.selected) {
						$("#selectedCount").html((parseInt($("#selectedCount").html()) - 1).toString());
					}
					else {
						$("#selectedCount").html((parseInt($("#selectedCount").html()) + 1).toString());
					}
				
					connection.selected = selected;
					$("#chk_" + i.toString()).prop('checked', selected);
				}
			}
		}
		
		$("#nowLoading").hide();
	}, 100);
}

function applyFiltering() {
	$("#nowLoading").show();
	$("#selectAll").prop('checked', false);
	
	setTimeout(function(){
		var searchName = $("#searchConnectionsByName").val();
		var searchOccupation = $("#searchConnectionsByOccupation").val();
			
		for(var i = 0; i < connections.length; i++) {
			var connection = connections[i];
			var connectionName = connection.firstName + ' ' + connection.lastName;
			
			connection.hidden = false;
			
			if(searchName != '' && searchOccupation != '') {
				connection.hidden = (connectionName.toLowerCase().indexOf(searchName) == -1 || connection.occupation.toLowerCase().indexOf(searchOccupation) == -1);
			}
			else if(searchName != '' && searchOccupation == '') {
				connection.hidden = (connectionName.toLowerCase().indexOf(searchName) == -1);
			}
			else if(searchName == '' && searchOccupation != '') {
				connection.hidden = (connection.occupation.toLowerCase().indexOf(searchOccupation) == -1);
			}
		}
		
		populateConnectionsList();
		$("#nowLoading").hide();
	}, 100);
}

function inviteSelected() {
	$("#nowLoading").show();
	
	setTimeout(function(){
		var toBeInvited = connections.filter(function(item){
			return item.selected;
		}).map(function(item){
			return item.objectUrn.toString();
		});
		
		if(toBeInvited != null && toBeInvited.length > 0) {
			var maxBatchIndex = (pageArray(toBeInvited, 50).ActualNumberOfPages - 1);
			inviteSelectedRecursively(toBeInvited, 50, 0, maxBatchIndex);
		}
		else {
			$("#nowLoading").hide();
		}
	}, 100);
}

function inviteSelectedRecursively(itemsArray, batchSize, batchIndex, maxBatchIndex) {
	if(batchIndex <= maxBatchIndex) {
		var settings = {
			"async": true,
			"crossDomain": true,
			"url": "https://www.linkedin.com/communities-api/v1/membership/invite",
			"method": "POST",
			"headers": {
				"accept": "application/json, text/javascript, */*; q=0.01",
				"csrf-token": csrfToken,
				"x-requested-with": "XMLHttpRequest",
				"content-type": "application/x-www-form-urlencoded",
				"accept-language": "en-US,en;q=0.8",
				"cache-control": "no-cache"
			},
			"data": {
				"communityId": currentGroupId.toString(),
				"inviteeMembershipIdArray": pageArray(itemsArray, batchSize, batchIndex).Items
			}
		}

		$.ajax(settings).done(function (response) {
			//console.log(response);
			inviteSelectedRecursively(itemsArray, batchSize, batchIndex + 1, maxBatchIndex);
			
		}).fail(function(jqXHR, textStatus){
			console.log(jqXHR);
			console.log(textStatus);
			$("#nowLoading").hide();
			alert("Problem has occured. Please check console for log.");
		});
	}
	else {
		for(var i = connections.length - 1; i >= 0; i--) {
			if(connections[i].selected) {
				connections.splice(i, 1);
				$("#selectedCount").html((parseInt($("#selectedCount").html()) - 1).toString());
			}
		}
		
		applyFiltering();
		$("#nowLoading").hide();
	}
}

function detectCurrentGroupId() {
	try {
		currentGroupId = location.href.replace("https://www.linkedin.com/groups/", "").replace("http://www.linkedin.com/groups/", "").split('/')[0];
	}
	catch(ex) {
		
	}
}

function detectCSRFToken() {
	try {
		csrfToken = $("a[href*='csrfToken']").eq(0).attr('href').split('csrfToken=')[1].split('&')[0].replace('ajax%3A', 'ajax:');
	}
	catch(ex) {
		
	}
}

function addSwitchToExtendedModeButton() {
	if($("#switchToExtendedModeButton").length <= 0) {
		$("div.main-content").prepend('<div id="divSwitchToExtendedModeButton" class="invite-connections-view" style="float:right;border-bottom: 0px solid #D0D3D6!important;"><button class="js-invite-btn invite-btn" onclick="getMyConnections();">Switch To Extended Mode</button></div><br/><br/>');
	}
}

function pageArray(array, pageSize, pageIndex) {
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
}

addSwitchToExtendedModeButton();