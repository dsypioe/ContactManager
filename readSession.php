<?php
// returns values of the session variables as a json
// used for retrieving login and id information from index page
session_start();
$id = 0;
$login = "";

// if these variables are not set, the user is not logged in
if(isset($_SESSION["sessionLogin"]))
{
    $login = $_SESSION["sessionLogin"];
}

// if these variables are not set, the user is not logged in
if(isset($_SESSION["sessionUserId"]))
{
    $id = $_SESSION["sessionUserId"];
}

returnWithInfo($id, $login);

// send json
function sendResultInfoAsJson( $obj )
{
    header('Content-type: application/json');
    echo $obj;
}

// return json with blank error field 
// *** error field is not used ***
function returnWithInfo( $id, $status )
{
    $retValue =   '{"id":' . $id . ',"login":"' . $login . '","error":""}';
    sendResultInfoAsJson( $retValue );
}	
?>
