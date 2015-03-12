<?php

if (isset($_GET["q"])) {
    $keyword = $_GET["q"];
} else {
    $keyword = "";
}

if (strlen($keyword) === 0) {
    echo json_encode(array());
} else {
    require_once("core/DbPediaService.php");
    $service = new DbPediaService();
    echo json_encode($service->spootlight($keyword));
}