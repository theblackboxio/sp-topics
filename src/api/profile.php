<?php
if (isset($_GET["r"])) {
    $resource = $_GET["r"];
} else {
    echo "[]";
    return;
}
require_once("core/DbPediaService.php");
$service = new DbPediaService();
$data = $service->resource($resource);
echo json_encode($data);
