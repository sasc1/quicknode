quicknode
================

#### Installation
The extension is installed like a normal extension in brackets. Copy the repository content in a brackets extension folder 
(for example ~/.config/Brackets/extensions/user/quicknode).
Another way is to download the zip file from github and drag it into the extension manager.
Quicknode was tested only on Linux. If you test it on windows, please give me some feedback.

#### Usage
With quicknode you can start node.js code, debug it with theseus and start the mongodb with a menu command or shurtcut.
If you install quicknode your run configurations will be visible in the DEBUG menu.  
The default configurations concentrate on node.js development:  
1. start mongo server ... (CTRL+F3)  
2. start node.js ... (CTRL+F8)  
3. start node.js + theseus ... (CTRL+F9)  

Before you want to start a configuration please select the correct javascript file in brackets, for example app.js or server.js.
This must be done for configuration 2. and 3. For configuration 1. you don't need to select a specific file in the editor.

The output of the started processes is by default in the "Debug" pane. You can use Console Plus extension to see it.
To use all the default run configurations you should have node.js, theseus and mongoDB installed.

**If you want to stop the process you should press the menu entry or shurtcut again.** Then the process is terminated.

##### Run configurations example
You can make your own run configurations with the menu entry **edit run configs** or editing the file runconf.json in the extension folder directly.
Be sure to restart brackets after you have edited this file.

The default run configuration file has entries like this:  
"name": "start mongo server ...",  // short description of command, it is displayed in the menu  
"comname": "quicknode.mongo",  // used internally, use always the "quicknode.my_command_name" format for your commands  
"cmd": "mongod",  // the actual command which is executed, for example the node.js server  
"rparam": ["--auth", "--dbpath", "/home/inet/mongodb/data/db"], // the parameter list of your command as a javascript array  
"shortcut": "Ctrl-F3", // shortcut to execute the command in brackets    
"outputto": "debug"  // place where all the output goes. options are "debug", "error", "info" and "warn"  

#### ToDo
1. Terminate all started processes automatically if one exit brackets.
2. Implement handling of command chains.

####Issues
1. If you start a configuration you should end it before exiting brackets. If you don't do this, the started process
will run in the background and is not killed. Next time you start brackets, quicknode will not function properly, because there
is already an instance running. To solve this issue you should kill the process you started on the command shell. Then everything will
be fine again. So stop all started processes before you exit brackets with executing the menu entries or shourtcuts again.
2. Don't use node.js and node.js+theseus configuration at once, cause node_theseus can't be started if node is already running. There can
be some hiccup if you do so.

####Other
On my blog you can read some tips regarding programming and the necessary tools.
Want some excellent IDEs for webdevelopment or some tips for angular.js ? Then visit me on
[my blog](http://sasc1.github.io)
