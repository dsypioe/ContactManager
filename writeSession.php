<?php
session_start();

$inData = getRequestInfo();

$_SESSION["sessionLogin"] = $inData["login"];
$_SESSION["sessionUserId"] = $inData["id"];

// get json data
function getRequestInfo()
{
    return json_decode(file_get_contents('php://input'), true);
}

?>