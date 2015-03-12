<?php
require_once("Database.php");
require_once("ParserService.php");

/*
 * Services related to topics.
 */
class TopicService {

    private $db;
    private $parserService;

    function __construct() {
        $this->db = new Database();
        $this->parserService = new ParserService();
    }

    /*
     * Given a keyword or a phrase returns the set of topics related with.
     */
    function getTopics($keywords) {

        $topicProviders = $this->db->getTopicProviders();

        $keywords = urlencode($keywords);
        $results = [];
        foreach ($topicProviders as $topicProvider) {
            $url = $topicProvider['url'];
            $id = $topicProvider['id'];
            $parser = $topicProvider['parser'];

            // Generate the url replacing the placeholder {{word}}
            $url = str_replace("{{word}}", $keywords, $url);

            // Request to providers
            $response = @file_get_contents($url);
            if ($response === FALSE) {
                echo 'Error: Provider '.$id.' with url '.$url.' failed.';
                die();
            } else {
                // Parse the response
                $partialResults = $this->parserService->parse($parser, $response);
                $partialResults = array_values($partialResults);
                $results = array_merge($results, $partialResults);
            }
        }

        $results = array_unique($results);
        $clean_results = array();
        foreach($results as $result) {
            if(strlen($result)>2) { // remove too short results like "at", "or", "in"
                $clean_results[]= $result;
            }
        }
        return $clean_results;
    }
}