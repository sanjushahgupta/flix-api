
const url = require('url'),
    http = require('http'),
    fs = require('fs');

http.createServer((request, response) => {
    let address = request.url,
        parsedResult = url.parse(address, true),
        filepath = '';

    fs.appendFile('log.txt', address + ': url is visited.' + '\nTimestamp: ' + new Date() + '\n\n', (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log('Visited url is added to log.txt file.');
        }
    });

    if (parsedResult.pathname.includes('/documentation')) {
        filepath = ('documentation.html')
    } else {
        filepath = 'index.html';
    }

    fs.readFile(filepath, (err, data) => {
        if (err) {
            throw err;
        }
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.write(data);
        response.end();
    });

}).listen(8080);
