<?php
session_start();
$id = 0;
$login = "ERROR";

if(isset($_SESSION["sessionLogin"]))
{
    $login = $_SESSION["sessionLogin"];
}

if(isset($_SESSION["sessionUserId"]))
{
    $id = $_SESSION["sessionUserId"];
}

    returnWithInfo($id, $login);

    //returnWithError( "No Records Found" );

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
		$retValue = '{"id":0,"login":"false","error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}

    // return json with blank error field
	function returnWithInfo( $idValue, $loginValue )
	{
		$retValue =   '{"id":' . $idValue . ',"login":"' . $loginValue . '","error":""}';
		sendResultInfoAsJson( $retValue );
	}
	
?>
