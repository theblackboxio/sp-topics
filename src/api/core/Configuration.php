<?php
/*
 * Configuration class.
 */
class Configuration {
    private $config = array();
    
    function __construct() {
        $this->config['db'] = array();
        $this->config['db']['host'] = "<%= database.host %>";
        $this->config['db']['port'] = "<%= database.port %>";
        $this->config['db']['name'] = "<%= database.name %>";
        $this->config['db']['user'] = "<%= database.user %>";
        $this->config['db']['password'] = "<%= database.password %>";
        $this->config['db']['driver'] = "<%= database.driver %>";
    }
    
    public function get() {
        return $this->config;
    }
}
?>