if(!this.console) {
    this.console = null;
}

var Logger =  {
    DEBUG: 4,
    WARN: 3,
    INFO: 2,
    ERROR: 1,
    
    logLevel: 2,
    
    log: function(){
        if(console) {
            console.log.apply(console, arguments);
        }
    },

    debug: function(){
        if(console && this.logLevel >= this.DEBUG) {
            console.debug.apply(console, arguments);
        }
    },

    info: function(){
        if(console && this.logLevel >= this.INFO) {
            console.info.apply(console, arguments);
        }
    },

    warn: function(){
        if(console && this.logLevel >= this.WARN) {
            console.warn.apply(console, arguments);
        }
    },

    error: function(){
        if(console && this.logLevel >= this.ERROR) {
            console.error.apply(console, arguments);
        }
    }
};

