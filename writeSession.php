<?php
// used to save login and id from index page to be retrieved by home page
session_start();
$inData = getRequestInfo();

// save login and id in session variables
$_SESSION["sessionLogin"] = $inData["login"];
$_SESSION["sessionUserId"] = $inData["id"];

// get json data
function getRequestInfo()
{
    return json_decode(file_get_contents('php://input'), true);
}

?>
