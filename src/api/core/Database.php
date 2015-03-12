<?php
require_once("configuration.php");

class Database {

    private $pdo;

    /*
     * Bare constructor that takes the database configuration from Configuration class.
     */
    function __construct() {
        $config = (new Configuration())->get();
        $url = $config['db']['driver'].":";
        $url .= "host=".$config['db']['host'].";";
        $url .= "port=".$config['db']['port'].";";
        $url .= "dbname=".$config['db']['name'];
        try {
            $this->pdo = new PDO($url, $config['db']['user'], $config['db']['password'], array(PDO::ATTR_PERSISTENT => false));
        } catch (PDOException $e) {
            print "Error!: " . $e->getMessage() . "<br/>";
            die();
        }
    }

    /*
     * Returns an array of objects such that each one represents a topic provider.
     */
    function getTopicProviders() {
        $topicProviders = $this->pdo->query("SELECT `topic_provider`.* FROM `topic_provider`");
        return $topicProviders;
    }

} 