/**
 * Created by guillermoblascojimenez on 09/02/15.
 */
(function($, vis) {
    function getUrlParameter(sParam) {
        var sPageURL = window.location.search.substring(1);
        var sURLVariables = sPageURL.split('&');
        for (var i = 0; i < sURLVariables.length; i++)
        {
            var sParameterName = sURLVariables[i].split('=');
            if (sParameterName[0] == sParam)
            {
                return sParameterName[1];
            }
        }
        return "";
    }
    var q = getUrlParameter("q");
    var m = getUrlParameter("m");
    var l = getUrlParameter("l");
    var dispatchDataCollected = function(data, panel, topic) {
        panel.empty();
        // process header
        var annotatedTopic = [];
        var count = 0;
        var lastWord = "";
        var entities = data["spotlight"];
        while (count < topic.length) {
            var entity = undefined;
            for (var i = 0; i < entities.length; i++) {
                if (entities[i]['@offset'] == count) {
                    entity = entities[i];
                    break;
                }
            }
            if (entity == undefined) {
                lastWord = lastWord + topic[count];
                count = count + 1;
                if (count === topic.length) {
                    annotatedTopic.push({w:lastWord});
                }
            } else {
                annotatedTopic.push({w:lastWord});
                lastWord = "";
                count = count + entity['@surfaceForm'].length;
                annotatedTopic.push({e:entity});
            }
        }
        panel.append(Mustache.render(templates.headerpanel, {title: annotatedTopic}));
        panel.find('[data-toggle="tooltip"]').tooltip();
        // process graph
        panel.append("<div id=\"graph-wrapper\"></div>");
        $("#graph-wrapper").height(300);
        var items = asSet(data["more-topics"]);
        createGraph("graph-wrapper", items);

        panel.append(Mustache.render(templates.linkpanel, {topic: topic}));
        // process suggest row
        panel.append("<div class=\"row\" id=\"suggests-row\"></div>");
        var suggestsRow = $("#suggests-row");
        console.log(data);
        var d = {
            head : "",
            list : [],
            m : m,
            l : l
        };
        d.head = "more suggestions";
        d.list = data["more-topics"];
        suggestsRow.append(Mustache.render(templates.suggestpanel, d));
        d.head = topic + " + como";
        d.list = data["more-topics-as"];
        suggestsRow.append(Mustache.render(templates.suggestpanel, d));
        d.head = topic + " + en";
        d.list = data["more-topics-in"];
        suggestsRow.append(Mustache.render(templates.suggestpanel, d));
    };
    var dispatchTopicRequest = function(topic, panel) {
        var topics_as = topic + " como";
        var topics_in = topic + " en";
        panel.empty();
        panel.append(templates.loading);
        var n = 0;
        var N = 4;
        panel.append("<p id=\"loading-feedback\">" + n.toString() +" of " + N.toString() +"</p>");
        var data = {};
        var display = function(key, preprocessfunction) {
            var d = function(value) {
                n = n + 1;
                $("#loading-feedback").text(n.toString() +" of " + N.toString());
                if (preprocessfunction === undefined) {
                    data[key] = value;
                } else {
                    data[key] = preprocessfunction(value);
                }
                if (n == N) {
                    dispatchDataCollected(data, panel, topic);
                }
            };
            return d;
        };
        $.ajax({
            url: "/spoots-graph/api/topic",
            data: {
                q : topic
            },
            success: display("more-topics", JSON.parse)
        });
        $.ajax({
            url: "/spoots-graph/api/topic",
            data: {
                q : topics_as
            },
            success: display("more-topics-as", JSON.parse)
        });
        $.ajax({
            url: "/spoots-graph/api/topic",
            data: {
                q : topics_in
            },
            success: display("more-topics-in", JSON.parse)
        });
        $.ajax({
            url: "/spoots-graph/api/spotlight",
            data: {
                q : topic
            },
            success: display("spotlight", JSON.parse)
        });

    };
    $(document).ready(function() {
        var topicInfoPanel = $("#topic-info");
        $("ul.topic-stack > li").click(function(event) {
            var topic = $(event.target).data("topic");
           console.log(topic);
            dispatchTopicRequest(topic, topicInfoPanel);
        });
    });
    var templates = {
        "headerpanel" :
            "<div class=\"topics-results-fixed-bar\">"+
            "   <h4>" +
            "       {{#title}}" +
            "           {{#e}}" +
            "       <a href=\"#\" data-toggle=\"tooltip\" title=\"\" data-placement=\"bottom\" data-original-title=\"{{@URI}}\">{{@surfaceForm}}</a>" +
            "           {{/e}}" +
            "           {{#w}}" +
            "       {{.}}" +
            "           {{/w}}" +
            "       {{/title}}" +
            "   </h4>"+
            "</div>",
        "linkpanel" :
            "<blockquote>" +
            "   <p>Consulta los " +
            "       <a class=\"btn btn-default btn-xs\" href=\"https://www.google.com/search?&q=filetype:pdf+{{topic}}\" target=\"_blank\">Documentos PDF</a> " +
            "       <a class=\"btn btn-default btn-xs\" href=\"https://www.google.com/search?&q=filetype:xls+{{topic}}\" target=\"_blank\">Documentos Excel</a> " +
            "       o amplía tu búsqueda con " +
            "       <a href=\"http://www.bing.com/search?q={{topic}}\" target=\"_blank\" class=\"btn btn-default btn-xs\" title=\"Buscar en Bing\">Bing</a>" +
            "       <a href=\"http://es.ask.com/web?q={{topic}}\" target=\"_blank\" class=\"btn btn-default btn-xs\" title=\"Buscar en Ask\">Ask</a> " +
            "       <a href=\"https://duckduckgo.com/?q={{topic}}\" target=\"_blank\" class=\"btn btn-default btn-xs\" title=\"Buscar en DuckDuckGo\">DuckDuckGo</a></p>" +
            "</blockquote>",
        "suggestpanel" :
            "<div class=\"col-md-4\">" +
            "   <div class=\"panel panel-default\">" +
            "       <div class=\"panel-heading\">{{head}}</div>" +
            "       <ul class=\"list-group\">" +
            "       {{#list}}<li class=\"list-group-item\">" +
            "           <a href=\"/spoots-graph/topics/dashboard?q={{.}}{{#m}}&m={{m}}{{/m}}{{#l}}&l={{l}}{{/l}}\">{{.}}</a>" +
            "       </li>{{/list}}" +
            "       </ul>" +
            "   </div>" +
            "</div>",
        "loading" : "<i class=\"fa fa-cog fa-spin\"></i>"
    };
    var createGraph = function(placeId, items) {
        // create an array with nodes
        var text = items.join(". ");
        var dispatch = function(d) {
            d = JSON.parse(d);
            var entities = {};
            for (var i = 0; i < d.length; i++) {
                entities[d[i]['@surfaceForm'].toLowerCase()] = d[i];
            }
            var nodes = [ ];
            var adjacencyMatrix = {};
            var id = 0;
            for (var entity in entities) {
                if (entities.hasOwnProperty(entity)) {
                    nodes.push({
                        id: id,
                        label: entity
                    });
                    entities[entity].id = id;
                    adjacencyMatrix[id] = {};
                    id++;
                }
            }
            for (i = 0; i < items.length; i++) {
                var itemEntities = {};
                for (var entity in entities) {
                    if (entities.hasOwnProperty(entity)) {
                        if (items[i].toLowerCase().indexOf(entity) > -1) {
                            itemEntities[entity] = true;
                        }
                    }
                }
                for (var itemEntity in itemEntities) {
                    for (var itemEntity2 in itemEntities) {
                        if (itemEntity !== itemEntity2) {
                            var id1 = entities[itemEntity].id;
                            var id2 = entities[itemEntity2].id;
                            if (adjacencyMatrix[id1][id2] == undefined && adjacencyMatrix[id2][id1] == undefined) {
                                adjacencyMatrix[id1][id2] = true;
                            }
                        }
                    }
                }
            }
            var edges = [];
            for (var point1 in adjacencyMatrix) {
                for (var point2 in adjacencyMatrix[point1]) {
                    edges.push({from: point1, to: point2});
                }
            }
            // create a network
            $("#graph-wrapper").empty();
            var container = document.getElementById(placeId);
            var data = {
                nodes: nodes,
                edges: edges
            };
            var network = new vis.Network(container, data, {});

        };
        $("#graph-wrapper").append(templates.loading);

        $.ajax({
            url: "/spoots-graph/api/spotlight",
            data: {
                q : text
            },
            success: dispatch
        });
    };

    var asSet = function() {
        var s = {};
        for (var i = 0; i < arguments.length; i++) {
            for (var j = 0; j < arguments[i].length; j++) {
                s[arguments[i][j]] = true;
            }
        }
        var l = [];
        for (var a in s) {
            if (s.hasOwnProperty(a)) {
                l.push(a);
            }
        }
        return l
    };
})(jQuery, vis);