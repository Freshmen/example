var http   = require('http');
var url    = require('url');
var fs     = require('fs');

// endswith for String
String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

// constructor
function Handler() {
    this.re_Js = new RegExp("^/js/(.*)(.js)$");
    this.re_Lib = new RegExp("^/libs/(.*)(.js|.css)$");
}

Handler.prototype._serve_file = function(filename, content_type, response) {
    var headers = {
        "content-type": content_type,
        "cache-control": "no-cache"
    };
    response.writeHead(200, headers);
    fs.readFile(filename, function(err, data) {
        if(err) {
            console.log(err);
            response.writeHead(404, {"content-type": "text/plain"});
            response.end("404 Not found");
        } else {
            response.end(data);
        }
    });
};

Handler.prototype._handleJs = function(path, response) {
    this._serve_file(".." + path, "application/x-javascript", response);
};

Handler.prototype._handleLib = function(path, response) {
    var ctype = path.endsWith(".css") ? "text/css" : "application/x-javascript";
    this._serve_file(".." + path, ctype, response);
};

Handler.prototype.handle = function(path, response) {
    console.log("handle: " + path);
    if(this.re_Js.test(path)) {
        this._handleJs(path, response);
    } else if(this.re_Lib.test(path)) {
        this._handleLib(path, response);
    } else {
        if(path == '/')
            path += "index.html";
        var ctype = path.endsWith(".html") ? "text/html" :
            "application/x-javascript";
        this._serve_file("." + path, ctype, response);
    }
};

// constructor
function Server() {
    this.handler = new Handler();
}

Server.prototype.start = function(port) {
    var handler = this.handler;
    http.createServer(function(request, response) {
        var path = url.parse(request.url).pathname;
        request.setEncoding("utf-8");
        request.addListener("end", function() {
            console.log("Request: " + request.method + " " + path);
            if(request.method === "GET") {
                handler.handle(path, response);
            } else {
                response.writeHead(501, {"content-type": "text/plain"});
                response.end("501 Not Implemented");
            }
        });
    }).listen(port);
    console.log("Server running at port " + port);
};

var port = 8124;
var server = new Server();

console.log("Starting server on port %d...", port);
server.start(port);
