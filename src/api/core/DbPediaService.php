<?php

class DbPediaService {

    public function spootlight($text, $confidence = 0.2, $support = 10) {

        $url = 'http://spotlight.dbpedia.org/rest/annotate';
        // set API arguments
        $params = array(
            'text' => stripslashes($text),
            'confidence' => $confidence,
            'support' => $support
        );
        $data =  $this->get($url, $params);

        if (isset($data['Resources'])) {
            return $data['Resources'];
        } else {
            return array();
        }
    }

    public function resource($uri) {
        $entityName = explode("/", $uri)[4];
        $url = "http://dbpedia.org/data/" . $entityName . ".json";
        $data = $this->get($url, array());
        return $data;
    }


    private function get($url, $params) {

        $ch = curl_init($url.'?'.http_build_query($params));
        curl_setopt($ch, CURLOPT_HTTPHEADER, array("Accept: application/json"));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        $raw_result = curl_exec($ch);
        $curl_info = curl_getinfo($ch);
        curl_close($ch);
        $data = json_decode($raw_result, true);
        return $data;
    }

}