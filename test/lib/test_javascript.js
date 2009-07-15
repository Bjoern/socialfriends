var o = {
    a: "hello world",
    fn: function() {
        var f = function() {
            print("from inner f: "+o.a);
        };
        f();
    }

};

o.fn();
