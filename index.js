var fs = require('fs'),
    path = require('path'),
    jscs = require('jscs'),
    loadConfigFile = require('jscs/lib/cli-config');

module.exports = function(config) {
    if (typeof config !== 'object') {
        config = {};
    }

    if (!Array.isArray(config.extensions)) {
        config.extensions = ['.js'];
    }

    var checker = new jscs({});

    try {
        var jscsrc = loadConfigFile.load('./.jscsrc');
    } catch (e) {}

    checker.registerDefaultRules();
    checker.configure(jscsrc || {});

    return {
        type: 'jscs',
        review: function(files, done) {
            var log = {
                success: true,
                errors: []
            };

            files.forEach(function(filename) {
                if (config.extensions.indexOf(path.extname(filename)) === -1) {
                    return;
                }

                try {
                    var errors = checker.checkString(fs.readFileSync(filename, 'utf8'), filename),
                        errorList = errors.getErrorList();

                    if (errorList.length) {
                        errorList.forEach(function(error) {
                            log.errors.push({
                                filename: error.filename,
                                line: error.line,
                                column: error.column,
                                rule: error.rule,
                                message: error.message
                            });
                        });
                    }
                } catch (error) {
                    log.errors.push({
                        filename: filename,
                        line: 0,
                        column: 0,
                        rule: '',
                        message: error.message
                    });
                }
            });

            if (log.errors.length) {
                log.success = false;
            }

            done(log);
        }
    };
};
