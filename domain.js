/**
 * (c) by sasc
 * A domain which implements an execute command. If the command is executed for the second time, it is terminated.
 **/
(function () {
    "use strict";

    var child_process = require("child_process"),
        domain = "quicknode.execute";

    // running processes are stored here in the format: [{ex_com:"PORT=1234 node",rparam:"server.js",proc:childe_process}, ...]
    var running_processes = [];

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
            console.log("Domain " + domain + " cannot log to " + log_to +
                ". Adjust run configuration file, option outputto. Possible values are debug, warn, error, info");
        }
    }

    // exec callback function
    function exec(directory, command, lparam, rparam, send_killsig, outputto, callback) {

        // build command and parameters
        var extended_com = command;

        if (lparam !== void 0) {
            if (Array.isArray(lparam) && (lparam.length > 0)) {

                extended_com = lparam.join(" ") + " " + command;
                output("error", "#####" + extended_com);
            } else if ((typeof lparam === 'string') && (lparam.length > 0)) {
                extended_com = lparam + " " + command;
            }
        }

        var rparam_string;
        if (rparam === void 0) {
            rparam_string = "";
        } else {
            rparam_string = rparam.join(" ");
        }

        // command already executed ? if yes, kill it and return
        for (var i = 0; i < running_processes.length; i++) {
            if (running_processes[i].ex_com === extended_com && running_processes[i].rparam === rparam_string) {
                if (send_killsig === "1") {
                    // killing wanted
                    running_processes[i].proc.kill("SIGKILL");
                } else {
                    // no killing, send SIGTERM
                    running_processes[i].proc.kill();
                }

                output(outputto, "Command \"" + running_processes[i].ex_com + (rparam_string === "" ? "" : " " + rparam_string) + "\" killed!");
                // take process out of list of running processes
                running_processes = running_processes.filter(function (e) {
                    return (e.ex_com !== extended_com && e.rparam !== rparam_string);
                });
                return;
            }
        }

        // execute command
        var running_process = child_process.spawn(extended_com, rparam, {
            cwd: directory
        });
        output(outputto, "Command \"" + extended_com + (rparam_string === "" ? "" : " " + rparam_string) + "\" started...");

        running_process.stdout.setEncoding('utf8');
        running_process.stdout.on("data", function (data) {
            if (data !== "") {
                output(outputto, data);
            }
        });
        running_process.stderr.setEncoding('utf8');
        running_process.stderr.on("data", function (data) {
            if (data !== "") {
                output(outputto, "stderr: " + data);
            }
        });
        running_process.on("exit", function (code) {
            if (code != 0) {
                output(outputto, "Command \"" + command + " failed with code: " + code);
                // process failed and was terminated, therefore take it out from running_processes
                running_processes = running_processes.filter(function (e) {
                    return (e.ex_com !== extended_com && e.rparam !== rparam_string);
                });
            }
        });

        // store current child_process
        running_processes.push({
            ex_com: extended_com,
            rparam: rparam_string,
            proc: running_process
        });
    }

    exports.init = function (DomainManager) {
        if (!DomainManager.hasDomain(domain)) {
            DomainManager.registerDomain(domain, {
                major: 0,
                minor: 1
            });
        }

        DomainManager.registerCommand(domain, "exec", exec, true, "executes a command", [
            {
                name: "directory",
                type: "string"
                },
            {
                name: "command",
                type: "string"
                },
            {
                name: "lparam",
                type: "string"
                },
            {
                name: "rparam",
                type: "string"
                },
            {
                name: "send_killsig",
                type: "string"
            },
            {
                name: "outputto",
                type: "string"
            }
            ], [{
            name: "stdout",
            type: "string"
            }]);
    };

}());