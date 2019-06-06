<?php

	$inData = getRequestInfo();
	
	$id = 0;
	$login = "";

    // connects to database and retrieves data (id and login)
	$conn = new mysqli("localhost", "*** USER NAME ***", "*** PASSWORD ***", "*** DATABASE ***");
	if ($conn->connect_error) 
	{
		returnWithError( $conn->connect_error );
	} 
	else
	{
		// Get id and login if login and password match database row.
		$sql = "SELECT id, login, password FROM users where login='" . $inData["login"] . "' and password='" . $inData["password"] . "'";
		$result = $conn->query($sql);
		if ($result->num_rows > 0)
		{
            $row = $result->fetch_assoc();
            $id = $row["id"]; 
            $login = $row["login"]; 
            
			returnWithInfo($id, $login);
		}
		
		// no matching user row in database
		else
		{
			returnWithError( "No Records Found" );
		}
		$conn->close();
	}
	
	// get json data
	function getRequestInfo()
	{
		return json_decode(file_get_contents('php://input'), true);
	}

    // send json
	function sendResultInfoAsJson( $obj )
	{
		header('Content-type: application/json');
		echo $obj;
	}

    // return json with error message
	function returnWithError( $err )
	{
		$retValue = '{"id":0,"login":"","error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}

    // return json with blank error field
	function returnWithInfo( $id, $login )
	{
		$retValue =   '{"id":' . $id . ',"login":"' . $login . '","error":""}';
		sendResultInfoAsJson( $retValue );
	}
	
?>