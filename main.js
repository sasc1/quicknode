/**
(c) by sasc
Extension for your custom run configurations. The available configurations concentrate on node development. You can run and
stop various node configurations through the Debug Menu or with shortcuts.
To add or edit additional run configurations, use menu command /Debug/edit run configs or change
the file runconf.json in the extension folder.
**/

/*jslint plusplus: true, vars: true, nomen: true */
/*global define, brackets, console, setTimeout */

define(function (require, exports, module) {
    "use strict";

    var AppInit = brackets.getModule("utils/AppInit"),
        ExtensionUtils = brackets.getModule("utils/ExtensionUtils"),
        domainPath = ExtensionUtils.getModulePath(module) + "domain",
        DocumentManager = brackets.getModule("document/DocumentManager"),
        CommandManager = brackets.getModule("command/CommandManager"),
        Dialogs = brackets.getModule("widgets/Dialogs"),
        Menus = brackets.getModule("command/Menus"),
        NodeConnection = brackets.getModule("utils/NodeConnection"),
        KeyBindingManager = brackets.getModule('command/KeyBindingManager'),
        FileUtils = brackets.getModule("file/FileUtils"),
        NodeConnection = brackets.getModule("utils/NodeConnection");

    var nodeConnection = new NodeConnection();

    var workingDirectory,
        selectedFile;

    var configs = JSON.parse(require('text!runconf.json'));


    /**
     * Returns a callback to handle a specific execution of configuration
     * @param {type} conf Description
     * @returns {type} Description
     */
    function getHandler(conf) {
        return function () {
            workingDirectory = DocumentManager.getCurrentDocument().file._parentPath;
            selectedFile = DocumentManager.getCurrentDocument().file._name;

            nodeConnection.connect(true).fail(function (err) {
                output(conf.outputto, "[[quicknode]] Cannot connect to node: " + err);
            }).then(function () {
                return nodeConnection.loadDomains([domainPath], true).fail(function (err) {
                    output(conf.outputto, "[[quicknode]] Cannot register domain: " + err);
                });
            }).then(function () {
                prepareConfValues(conf);
            }).then(function () {
                nodeConnection.domains["quicknode.execute"].exec(workingDirectory, conf.cmd, conf.lparam, conf.rparam, conf.sigkill, conf.outputto)
                    .fail(function (err) {
                        if (err !== "cleanup") {
                            output(conf.outputto, "[[quicknode]] Domain error: " + err);
                        }
                    })
                    .then(function (data) {
                        if (data != "") {
                            output(conf.outputto, "[[quicknode]] Execution successful: " + data);
                        }
                    });
            }).done();
        }
    }

    /**
     * outputs messages to user
     * @param {string} Can be "debug", "warn", "error", "info".
     * @param {string} Message to log.
     */
    function output(log_to, message) {
        if (log_to === "debug") {
            console.log(message);
        } else if (log_to === "warn") {
            console.warn(message);
        } else if (log_to === "error") {
            console.error(message);
        } else if (log_to === "info") {
            console.info(message);
        } else {
            output(conf.outputto, "Doman " + domain + " cannot log to " + log_to +
                ". Adjust run configuration file, option outputto. Possible values are debug, warn, error, info");
        }
    }

    /**
    * set default values for configuration and replaces identifier lie $FILE
    * @param {Object} conf Configuration 

    */
    function prepareConfValues(conf) {
        // set default values
        conf.lparam = conf.lparam || [];
        conf.rparam = conf.rparam || [];
        conf.sigkill = conf.sigkill || "0";

        // replace identifier $FILE
        conf.lparam.forEach(function (el, i) {
            conf.lparam[i] = el.replace(/\$FILE/g, selectedFile);
        });

        conf.rparam.forEach(function (el, i) {
            conf.rparam[i] = el.replace(/\$FILE/g, selectedFile);
        });
    }

    AppInit.appReady(function () {

        var menu_debug = Menus.getMenu("debug-menu");
        menu_debug.addMenuDivider();

        configs.forEach(function (el) {
            CommandManager.register(el.name, el.comname, getHandler(el));
            KeyBindingManager.addBinding(el.comname, el.shortcut);
            menu_debug.addMenuItem(el.comname);
        });

        // Add menu item to edit run config file
        var menu_edit = Menus.getMenu("debug-menu");
        menu_edit.addMenuDivider();

        CommandManager.register("edit run configs", 'quicknode.editrunconf', function () {
            Dialogs.showModalDialog('', 'quicknode', 'Please restart Brackets after editing the run configs.');
            var src = FileUtils.getNativeModuleDirectoryPath(module) + "/runconf.json";

            DocumentManager.getDocumentForPath(src).done(
                function (doc) {
                    DocumentManager.setCurrentDocument(doc);
                }
            );
        });

        menu_edit.addMenuItem('quicknode.editrunconf');

    });

});