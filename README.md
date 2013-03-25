# TinyCore.js 

`Version 0.4.1`

## Overview

A tiny modular architecture framework in JavaScript.

Inspiration : "Scalable JavaScript Application Architecture", by Nicholas C. Zakas.
- Video : [http://www.youtube.com/watch?v=vXjVFPosQHw](http://www.youtube.com/watch?v=vXjVFPosQHw)
- Slides : [http://www.slideshare.net/nzakas/scalable-javascript-application-architecture-2012](http://www.slideshare.net/nzakas/scalable-javascript-application-architecture-2012)

Online demo : <a href="http://www.sparring-partner.be/tinycore.js/demos/todolist/index.html" target="_blank">A simple todo list application</a>

## Features

- Less than 2.5Kb minified
- Extensible
- Supports unit testing of the modules
- Supports async modules loading using AMD and [require.js](http://requirejs.org) (less than 1Kb extension)
- Tested under IE7+, Safari 5.1, Opera 12, Chrome 24+ and Firefox 18+

## Benefits

- Decoupled application architecture
- Divide & conquer : each *module* implements only a functionality or a small set of functionalities
- Modules are independent : change/removal/failure of one does not affect the others
- Reusability : modules can be reused across a number of different applications
- Testing : modules can be tested individually both inside and outside of the application

## Usage

Include TinyCore.js :

```html
    <script type="text/javascript" src="TinyCore.js"></script> 
```

This will give you access to the global variable `TinyCore` and its components : `TinyCore.Module`, `TinyCore.SandBox` and `TinyCore.ErrorHandler`.
<br/>


##Quick Start Guide

###1.- How to Register and Start a Module

[TinyCore.js - Register and Start a Modules](http://jsfiddle.net/juanma/eQ498/embedded/js,result)

####1.1.- Register a Module

Before using a module we need to register it 
```javascript
// Register the Module
TinyCore.Module.register( 'my-module', function( bus ) {
    return {
        onStart: function( oData ) {
            alert(oData.msg);
        }
    };
});
```

####1.2.- Start a Module

Once the module is registered, we can start it
```javascript
 TinyCore.Module.start("my-module", { msg : "Hello World!" });
```

#### More Examples

- [TinyCore.js - Register/Start Modules (basic)](http://jsfiddle.net/juanma/bVZy5/)
- [TinyCore.js - Register/Start Modules (intermediate)](http://jsfiddle.net/juanma/36J6M/)

###2.- How to Subscribe/Publish Topics

[TinyCore.js - Subscribe/Publish Topics](http://jsfiddle.net/juanma/Sjq4S/embedded/)

####2.1.- Subscribe to a Topic
From one module we can listen to some "event"
```javascript
// Register the Listener Module    
TinyCore.Module.register( 'module-listener', function( oSandbox ) {
    return {
        onStart: function() {
            oSandbox.subscribe ('my-topic', function(oTopic) {
                alert(oTopic.data.msg);
            });               
        }
    };
});
```

####2.2.- Publish Topics
From another module (or the same is listening this event) we can notify this "topic" (event)
```javascript
// Register the Notifier Module    
TinyCore.Module.register( 'module-notifier', function( oSandbox ) {
    return {
        onStart: function( oData ) {
            oSandbox.publish ('my-topic', oData );
        }
    };
});
```

####2.3.- Stoping modules
If we want to stop listening to "events" we can stop the module
```javascript
TinyCore.Module.stop("my-module");
```

#### More Examples

- [TinyCore.js - Subscribe/Publish Events](http://jsfiddle.net/juanma/T37kN/)
- [TinyCore.js - Subscribe/UnSubscribe/Publish Events ](http://jsfiddle.net/juanma/DYxqN/)

## Creators

- Main dev : Mawrkus aka Marc Mignonsin (<web@sparring-partner.be>)
- JuanMa aka Juan Manuel Garrido (<juanma.garrido@gmail.com>)

## RoadMap

- More demos
- Full API documentation
- More extensions
- Add a source map
