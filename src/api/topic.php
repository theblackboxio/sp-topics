<?php

if (isset($_GET["q"])) {
    $keyword = $_GET["q"];
} else {
    $keyword = "";
}

if (strlen($keyword) === 0) {
    echo json_encode(array());
} else {
    require_once("core/TopicService.php");
    $service = new TopicService();
    echo json_encode(array_values($service->getTopics($keyword)));
}


