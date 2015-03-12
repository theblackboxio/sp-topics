<?php
    require 'lib/mustache/src/Mustache/Autoloader.php';
    Mustache_Autoloader::register();

    $mustache = new Mustache_Engine(array(
        'loader' => new Mustache_Loader_FilesystemLoader(dirname(__FILE__).'/views'),
        'logger' => new Mustache_Logger_StreamLogger('php://stderr'),
    ));
    if (isset($_GET["q"])) {
        $wordRequest = $_GET["q"];
    } else {
        $wordRequest = "";
    }
    if (strlen($wordRequest) > 0) {
        require_once("api/core/TopicService.php");
        $topicService = new TopicService();
        $topics = $topicService->getTopics($wordRequest);
    } else {
        $topics = array();
    }
    $tpl = $mustache->loadTemplate('explorer');
    echo $tpl->render(array(
        'wordRequest' => $wordRequest,
        'topics' => $topics,
        'areTopics' => empty($topics)
    ));

?>