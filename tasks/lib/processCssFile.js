'use strict';

var css = require('css');
var flatten = require('flatten');

module.exports = function(data) {
    var paths = [];
    var cssObj = css.parse(data);

    var filterDeclarations = function(declaration) {
        var hasBackgroundUrl = (/background/).test(declaration.property) && (/url/).test(declaration.value);
        var hasContentUrl = (/content/).test(declaration.property) && (/url/).test(declaration.value);
        var hasSrcUrl = (/src/).test(declaration.property) && (/url/).test(declaration.value);

        // Check if it has a background property, and if so, check that it contains a URL
        return hasBackgroundUrl || hasContentUrl || hasSrcUrl;
    };

    var extractDeclaration = function(declaration) {
        return declaration.value.split(',').map(function(val) {
            return val.match(/url\(["|']?(.*?)['|"]?\)/)[1];
        });
    };

    // Loop through each stylesheet rules
    cssObj.stylesheet.rules.forEach(function(rule) {
        var mediaQueryDeclarations = rule.type !== 'media' ? [] : rule.rules.reduce(function(acc, rule) {
            return acc.concat(rule.declarations);
        }, []);

        var declarations = (rule.declarations || []).concat(mediaQueryDeclarations);

        // Loop through all declarations
        if (declarations && declarations.length > 0) {
            var foundDeclarations = declarations
                .filter(filterDeclarations)
                .map(extractDeclaration);

            paths = paths.concat(foundDeclarations);
        }
    });

    return flatten(paths);
};