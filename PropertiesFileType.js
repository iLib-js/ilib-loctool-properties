/*
 * PropertiesFileType.js - manages a collection of android resource files
 *
 * Copyright © 2019, JEDLSoft
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var path = require("path");
var log4js = require("log4js");

var PropertiesFile = require("./PropertiesFile.js");

var logger = log4js.getLogger("loctool.plugin.PropertiesFileType");

/**
 * @class Manage a collection of Android resource files.
 *
 * @param {Project} project that this type is in
 */
var PropertiesFileType = function(project) {
    this.type = "properties";

    this.project = project;
    this.resourceFiles = {};
    this.API = project.getAPI();

    this.extensions = [ ".properties" ];
};

/*
PropertiesFileType.prototype = new FileType();
PropertiesFileType.prototype.parent = FileType;
PropertiesFileType.prototype.constructor = PropertiesFileType;
*/

/**
 * Return true if this file type handles the type of file in the
 * given path name.
 * @param {String} pathName the path to check
 * @returns true if this file type handles the given path name, and
 * false otherwise
 */
PropertiesFileType.prototype.handles = function(pathName) {
    // js resource files are only generated. Existing ones are never read in.
    logger.debug("PropertiesFileType handles " + pathName + "?");

    logger.debug("No");
    return false;
};

/**
 * Write out all resources for this file type. For JavaScript resources, each
 * resource file is written out by itself. This method will
 * iterate through all of the resource files it knows about and cause them
 * each to write out.
 */
PropertiesFileType.prototype.write = function() {
    logger.trace("Now writing out " + Object.keys(this.resourceFiles).length + " resource files");
    for (var hash in this.resourceFiles) {
        var file = this.resourceFiles[hash];
        file.write();
    }
};

PropertiesFileType.prototype.name = function() {
    return "Java Properties File";
};

/**
 * Return a new file of the current file type using the given
 * path name.
 *
 * @param {String} pathName the path of the resource file
 * @return {PropertiesFile} a resource file instance for the
 * given path
 */
PropertiesFileType.prototype.newFile = function(pathName) {
    var file = new PropertiesFile({
        project: this.project,
        pathName: pathName,
        type: this,
        API: this.API
    });

    var locale = file.getLocale() || this.project.sourceLocale;

    this.resourceFiles[locale] = file;
    return file;
};

/**
 * Find or create the resource file object for the given project, context,
 * and locale.
 *
 * @param {String} locale the name of the locale in which the resource
 * file will reside
 * @return {PropertiesFile} the Android resource file that serves the
 * given project, context, and locale.
 */
PropertiesFileType.prototype.getResourceFile = function(locale) {
    var key = locale || this.project.sourceLocale;

    var resfile = this.resourceFiles && this.resourceFiles[key];

    if (!resfile) {
        resfile = this.resourceFiles[key] = new PropertiesFile({
            project: this.project,
            locale: key
        });

        logger.trace("Defining new resource file");
    }

    return resfile;
};

/**
 * Return all resource files known to this file type instance.
 *
 * @returns {Array.<PropertiesFile>} an array of resource files
 * known to this file type instance
 */
PropertiesFileType.prototype.getAll = function() {
    return this.resourceFiles;
};

/**
 * Ensure that all resources collected so far have a pseudo translation.
 */
PropertiesFileType.prototype.generatePseudo = function(locale, pb) {
    var resources = this.extracted.getBy({
        sourceLocale: pb.getSourceLocale()
    });
    logger.trace("Found " + resources.length + " source resources for " + pb.getSourceLocale());
    var resource;

    resources.forEach(function(resource) {
        logger.trace("Generating pseudo for " + resource.getKey());
        var res = resource.generatePseudo(locale, pb);
        if (res && res.getSource() !== res.getTarget()) {
            this.pseudo.add(res);
        }
    }.bind(this));
};

PropertiesFileType.prototype.getDataType = function() {
    return this.datatype;
};

PropertiesFileType.prototype.getResourceTypes = function() {
    return {};
};

/**
 * Return the list of file name extensions that this plugin can
 * process.
 *
 * @returns {Array.<string>} the list of file name extensions
 */
PropertiesFileType.prototype.getExtensions = function() {
    return this.extensions;
};

/**
 * Return the name of the node module that implements the resource file type, or
 * the path to a javascript file that implements the resource filetype.
 * @returns {Function|undefined} node module name or path, or undefined if this file type does not
 * need resource files
 */
PropertiesFileType.prototype.getResourceFileType = function() {};

/**
 * Return the translation set containing all of the extracted
 * resources for all instances of this type of file. This includes
 * all new strings and all existing strings. If it was extracted
 * from a source file, it should be returned here.
 *
 * @returns {TranslationSet} the set containing all of the
 * extracted resources
 */
PropertiesFileType.prototype.getExtracted = function() {
    return this.extracted;
};

/**
 * Add the contents of the given translation set to the extracted resources
 * for this file type.
 *
 * @param {TranslationSet} set set of resources to add to the current set
 */
PropertiesFileType.prototype.addSet = function(set) {
    this.extracted.addSet(set);
};

/**
 * Return the translation set containing all of the new
 * resources for all instances of this type of file.
 *
 * @returns {TranslationSet} the set containing all of the
 * new resources
 */
PropertiesFileType.prototype.getNew = function() {
    return this.newres;
};

/**
 * Return the translation set containing all of the pseudo
 * localized resources for all instances of this type of file.
 *
 * @returns {TranslationSet} the set containing all of the
 * pseudo localized resources
 */
PropertiesFileType.prototype.getPseudo = function() {
    return this.pseudo;
};

module.exports = PropertiesFileType;
