/*
A note from Jonas:
    This is still a work in progress. I have over commented a bit, just to be on the safe side.
    All comments about things that need to be changed will begin and end with three asterisks ***.
*/

var apiUrl  = "http://contactmanager.online/php";
var rootUrl = "http://contactmanager.online";
var dotPhp = ".php";

var userId = 0;
var login = "";
var jsonContacts = "";
var dataArray = [["","","","","",""]]; // stores data for data table
var contactId = 0;
var contactsTable;

// initialize datatable for contact info
function initTable()
{
    contactsTable = $('#contacts').DataTable( {
    data: dataArray,
   
     "columnDefs": [
    
    { "visible": false, "targets": 2 },
    { "visible": false, "targets": 3  },
    { "visible": false, "targets": 4  },
    { "visible": false, "targets": 5  }
    
	],
   
	columns : [
			
	{ title : "First"   },
	{ title : "Last"    },
	{ title : "phone"   },
	{ title : "id"      },
	{ title : "email"   },
	{ title : "address" }
           
	],
	searching : false,        

	} );
}

// This function updates the loginAndId variable with the user's login and id data.
// It is used to share login and id data between the login page and the home page.
function updateLoginAndUserId()
{
    // Get the session data (id and login) that was saved from the login page.
    readSession();

    document.getElementById("userLogin").innerHTML = login;

    // Send the user to the index page if they try to access the home page without logging in.
    if(userId === 0)
        window.location.href = rootUrl + '/index.html', true;
    else
        getContacts();
}

// attempts to log in an existing user
// *** Remove return values if they are not used. ***
function loginUser()
{
    userId = 0;
    login = "";

    // Get user input values.
    login = document.getElementById("loginNameText").value.trim();
    var password = document.getElementById("loginPasswordText").value.trim();
    
	// login-data json that interfaces with php / api
	var jsonPayload = '{"login" : "' + login + '", "password" : "' + password + '"}';
	var url = apiUrl + '/loginUser' + dotPhp;
    var sessionUrl = apiUrl + '/writeSession' + dotPhp;

    // Empty inputs are invalid.
    if(login === "" || password === "")
    {
        document.getElementById("invalidAccount").innerHTML = "*Invalid Username or Password"; 
        return false;
    }

	// http POST : Attempt to send json with login data to server.
	var xhr = new XMLHttpRequest();
	xhr.open("POST", url, false);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.send(jsonPayload);

	    // Receive json response, including autoincrement user key (id) value.	
		var jsonObject = JSON.parse( xhr.responseText );
		userId = jsonObject.id;

		// if userId is still at its initial value, the login has failed.
		if( userId < 1 )
		{
			document.getElementById("invalidAccount").innerHTML = "*Invalid Username or Password";
			return false;
		}

		document.getElementById("loginNameText").value = "";
		document.getElementById("loginPasswordText").value = "";
    
        // Save the session data (id and login) so it can be retrieved when home is loaded.
        writeSession();		
		
		// Load home page.
		window.location.href = rootUrl + '/home.html', true;
		
	    return true;	
	}
	catch(err)
	{
	    return false;
	}
}

// write user id and login from index page to be retrieved by home page
function writeSession()
{
	var jsonPayload = '{"login" : "' + login + '", "id" : "' + userId + '"}'; 
	var url = apiUrl + '/writeSession' + dotPhp;

	// http POST : Attempt to send json with login data to server.
	var xhr = new XMLHttpRequest();
	xhr.open("POST", url, false);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		// send data to be saved in session variables
		xhr.send(jsonPayload);
	}
	catch(err)
	{
	    // *** add error handler ***
	}
}

// This function gets the session data (id and login) that was saved from the login page.
function readSession()
{
	var jsonPayload = '{"login" : "' + login + '", "id" : "' + userId + '"}'; 
	var url = apiUrl + '/readSession' + dotPhp;
    
	// http POST : Attempt to send json with login data to server.
	var xhr = new XMLHttpRequest();
	xhr.open("POST", url, false);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.send(jsonPayload); // *** This doesn't need to be sent, because the php is just sending the session variable values in a json. ***

	    // Receive json response, including login and autoincrement user key (id) value.	
		var jsonObject = JSON.parse( xhr.responseText );
		userId = jsonObject.id;
		login = jsonObject.login;		
	}
	catch(err)
	{
		// *** add error handler ***
	}
}

function updateContact()
{
    // Get user input values.
    var id = contactId;
    var first = document.getElementById("newFirstText").value.trim();
    var last = document.getElementById("newLastText").value.trim();
    var email = document.getElementById("newEmailText").value.trim();
    var phone = document.getElementById("newPhoneText").value.trim();
    var address = document.getElementById("newAddressText").value.trim();
	
	// truncate phone number string if it is longer than 13 characters
    while(phone.length > 13)
    {
        phone = phone.substring(0, phone.length - 1);
    }

	// login-data json that interfaces with php / api
	var jsonPayload = '{"id" : "' + id + '", "last" : "' + last + '", "first" : "' + first + '", "email" : "' + email + '", "phone" : "' + phone + '", "address" : "' + address + '"}';
	var url = apiUrl + '/updateContact' + dotPhp;
	
	// http POST : Attempt to send json with login data to server.
	var xhr = new XMLHttpRequest();
	xhr.open("POST", url, false);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.send(jsonPayload);
        // updates local (client-side) contacts data
        getContacts();
        $("#editModal").modal('hide');
	}
	catch(err)
	{
        // *** add error handler ***
	}
}

// This function updates jsonContacts with user's contacts.
// The data in jsonContacts is NOT associative. It's indexed with integers.
// For example, this is the data for the first contact in alphabetical order:
// contact 0 (first in alphabetical order)
// _____________________________________________________________________________________   
// | first              | last               | phone              | id (auto increment) |
// | jsonContacts[0][0] | jsonContacts[0][1] | jsonContacts[0][2] | jsonContacts[0][3]  |
// |____________________|____________________|____________________|_____________________|
function getContacts()
{
    // Don't retrieve contacts if user is logged out.
	if(userId === 0)
	{
	    return;
	}

	// login-data json that interfaces with php / api
	var jsonPayload = '{"id" : ' + userId + '}';
	var url = apiUrl + '/getContacts' + dotPhp;
	
	// http POST : Attempt to send json with id data to server.
	var xhr = new XMLHttpRequest();
	xhr.open("POST", url, false);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.send(jsonPayload);

	    // Receive json response, including info for all contacts.
		jsonContacts = JSON.parse( xhr.responseText );
		refreshTable();        
	}
	catch(err)
	{
        // *** add error handler ***
	}
}

// create datatable with first and last name columns
function createTable()
{
     $('#contacts').DataTable( {
        data: dataArray,
        columns : [
            { title : "Last" },
            { title : "First" }
        ]
    } );
}

// refresh the datatable containing contact info
function refreshTable()
{
	var i;
	
	// clear all entries out of array of contact info
	while(Object.keys(dataArray).length > 0)
	{
		dataArray.pop();
	}
	
	// copy contact info to array
	for(i = 0; i < Object.keys(jsonContacts).length; i++)
	{
		dataArray[i] = jsonContacts[i];
	}
        
	// prevent last element from duplicating after a contact is deleted 
	// *** no longer needed because all entries are cleared first ***
	while(Object.keys(dataArray).length > Object.keys(jsonContacts).length)
	{
		dataArray.pop();
	}
   
	// deletes error contact entry
	if(dataArray[0][0] === "_NO_CONTACTS_ERROR_")
	{
		dataArray.shift();
	}
  	
	// add contact info from array to datatable
	contactsTable.clear();
    contactsTable.rows.add(dataArray);
    contactsTable.draw();  
}

// Gets all info for a contact using the json index, not id value.
// This function is mostly for testing.
// The full contact info is available in the jsonContacts:
// ________________________________________________________________________________________________________________________________
// | first              | last               | phone              | id (auto increment) | email              | address            |
// | jsonContacts[0][0] | jsonContacts[0][1] | jsonContacts[0][2] | jsonContacts[0][3]  | jsonContacts[0][4] | jsonContacts[0][5] |
// |____________________|____________________|____________________|_____________________|____________________|____________________|
function getFullContactInfo(data)
{
    document.getElementById("newFirstText").innerHTML    = data[0];
    document.getElementById("newLastText").innerHTML   = data[1];
    document.getElementById("newPhoneText").innerHTML   = data[2];
    document.getElementById("newEmailText").innerHTML   = data[4];
    document.getElementById("newAddressText").innerHTML = data[5];

    $('#newFirstText').val(data[0]);
    $('#newLastText').val(data[1]);
    $('#newPhoneText').val(data[2]);
    $('#newEmailText').val(data[4]);
    $('#newAddressText').val(data[5]);
    
    contactId = data[3];
    
    $("#editModal").modal();
}

// logs out user and sends them to the index page
function logoutUser()
{
	userId = 0;
	login = "";
    window.location.href = rootUrl + '/index.html', true;
}

// returns true if user has an account and false otherwise
function isExistingUser(loginString)
{    
    var jsonPayload = '{"login" : "' + loginString + '"}';
	var url = apiUrl + '/isExistingUser' + dotPhp;
    var userStatus;

	// http POST : Attempt to send json with login data to server.
	var xhr = new XMLHttpRequest();
	xhr.open("POST", url, false);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.send(jsonPayload);

	    // Receive json response.
		var jsonObject = JSON.parse( xhr.responseText );
		userStatus = jsonObject.userStatus;
		
		if( userStatus === "false" )
		{
			return false;
		}

	    return true;	
	}
	catch(err)
	{
        // *** add error handler ***
	    return false;
	}
}

// creates a new account
function addUser()
{
    // Get user input for new-account login and pasword.
    login = document.getElementById("loginNameText").value.trim();
    var password = document.getElementById("loginPasswordText").value.trim();
    
    if(login === "" || password === "")
    {
        document.getElementById("invalidAccount").innerHTML = "*Invalid Username or Password";
        return;
    }

    // log in user if they already have an account and return    
    if(isExistingUser(login))
    {
		loginUser();
        return;
    }

	// login-data json that interfaces with php / api
	var jsonPayload = '{"login" : "' + login + '", "password" : "' + password + '"}';
	var url = apiUrl + '/addUser' + dotPhp;

	// http POST : Attempt to send json with new-account login and pasword data to server.	
	var xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
        // *** possibly remove this ***
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{

			}
		};
		xhr.send(jsonPayload);
        loginUser();
	}
	catch(err)
	{
        // *** add error handler ***
	}
}

function clearContactFields()
{
    document.getElementById("lastText").value = "";
    document.getElementById("firstText").value = "";
    document.getElementById("emailText").value = "";
    document.getElementById("phoneText").value = "";
	document.getElementById("addressText").value = "";

    document.getElementById("lastText").innerHTML = "";
    document.getElementById("firstText").innerHTML = "";
    document.getElementById("emailText").innerHTML = "";
    document.getElementById("phoneText").innerHTML = "";
	document.getElementById("addressText").innerHTML = "";
}

// creates a new contact
function addContact()
{
    // Get user input information for new-contact.
	// *** We should validate all of these. For example email address should be in the     ***
	// *** form alphanumeric@alphanumeric.alphabetic, and first name should be alphabetic. ***
	var last = document.getElementById("lastText").value.trim();
    var first = document.getElementById("firstText").value.trim();
    var email = document.getElementById("emailText").value.trim();
    var phone = document.getElementById("phoneText").value.trim();
	var address = document.getElementById("addressText").value.trim();

	// contact-data json that interfaces with php / api
	var jsonPayload = '{"last" : "' + last + '","first" : "' + first + '", "email" : "' + email + '", "phone" : "' + phone + '", "address" : "' + address + '", "userId" : ' + userId + '}';
	var url = apiUrl + '/addContact' + dotPhp;

	// http POST : Attempt to send json with new-contact data to server.		
	var xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
                // updates local (client-side) contacts data
                getContacts();
                $("#editModal").modal('hide');
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
        // *** add error handler ***
	}
}

// This function searches for contacts with matches based on an input string.
// It updates jsonContacts with the contacts with matching "first" rows.
function searchContacts()
{	
    key = document.getElementById("searchText").value.trim();
	
	// login-data json that interfaces with php / api
	var jsonPayload = '{"id" : ' + userId + ', "key" : "' + key + '"}';
	var url = apiUrl + '/searchContacts' + dotPhp;
	
	// http POST : Attempt to send json with id and key infomation to server.
	var xhr = new XMLHttpRequest();
	xhr.open("POST", url, false);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.send(jsonPayload);

	    // Receive json response, including autoincrement user key (id) value.	
		jsonContacts = JSON.parse( xhr.responseText );
		refreshTable();
	}
	catch(err)
	{
        // *** add error handler ***
	}	
	document.getElementById("searchText").innerHTML = "";
    document.getElementById("searchText").value = "";
}

// Delete contact with corresponding id.
function deleteContact()
{
	var id = contactId;
	
	// contact-data json that interfaces with php / api
	var jsonPayload = '{"id" : ' + id + '}';
	var url = apiUrl + '/deleteContact' + dotPhp;

	// http POST : Attempt to send json with contact-id data to server.		
	var xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
                $("#editModal").modal('hide');
			}
		};
		xhr.send(jsonPayload);
        var jsonObject = JSON.parse( xhr.responseText ); // This data is not used.
	}
	catch(err)
	{
        // *** add error handler ***
	}
	
	// 1 second pause to ensure database is updated before contacts are retrieved and table is refreshed
    setTimeout(function(){
        getContacts();
        refreshTable();
    }, 1000);

}














