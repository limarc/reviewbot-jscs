var fs = require('fs'),
    jscs = require('jscs'),
    loadConfigFile = require('jscs/lib/cli-config');

module.exports = function(extensions) {
    if (!extensions || extensions.constructor !== Array) {
        extensions = ['js', 'es6'];
    }

    var checker = new jscs({ esnext: true }),
        config;

    try {
        config = loadConfigFile.load('./.jscsrc');
    } catch (e) {}

    checker.registerDefaultRules();
    checker.configure(config || {});

    return {
        type: 'jscs',
        review: function(files, params, done) {
            var log = {
                success: true,
                errors: []
            };

            files.forEach(function(filename) {
                if (extensions.indexOf(filename.split('.').pop()) === -1) {
                    return;
                }

                try {
                    var errors = checker.checkString(String(fs.readFileSync(filename)), filename),
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
