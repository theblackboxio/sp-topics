<?php

class ParserService {

    public function parse($parserName, $response) {
        require_once("parser.php");
        return $parserName($response);
    }

} 