/* 
 * ajaxify.js 
 * Ajaxify your site out of the box, instantly.
 * http://4nf.org/ 
 * 
 * Copyright Arvind Gupta; MIT Licensed 
 */ 
 
/* INTERFACE: See also http://4nf.org/interface/

Simplest plugin call:

jQuery('#content').ajaxify();
Ajaxifies the whole site, dynamically replacing the div with the ID '#content' across pages

If several divs should be swapped, just specify their IDs like this:
jQuery('#content, #nav').ajaxify();

The plugin can take an arbitrary amount of IDs, however the first one should specify the main content div


Options default values
{
// basic config parameters
    selector : "a:not(.no-ajaxy):not([target='_blank'])",  //Selector for elements to ajaxify - without being swapped - e.g. a selection of links
    forms : "form:not(.no-ajaxy)", // jQuery selection for ajaxifying forms - set to "false" to disable
    canonical : true, // Fetch current URL from "canonical" link if given, updating the History API.  In case of a re-direct...
 
// visual effects settings
    requestDelay : 0, //in msec - Delay of Pronto request
    aniTime : 0, //in msec - must be set for animations to work
    aniParams : false, //Animation parameters - see below.  Default = off
    previewoff : true, // Plugin previews prefetched pages - set to "false" to enable or provide a jQuery selection to selectively disable
    idleTime: 0, //in msec - master switch for slideshow / carousel - default "off"
    slideTime: 0, //in msec - time between slides
    menu: false, //Selector for links in the menu
    addclass: "jqhover", //Class that gets added dynamically to the highlighted element in the slideshow
 
// script and style handling settings, prefetch
    deltas : true, // true = deltas loaded, false = all scripts loaded
    inline : true, // true = all inline scripts loaded, false = only specific inline scripts are loaded
    inlinehints : false, // strings - separated by ", " - if matched in any inline scripts - only these are executed - set "inline" to false beforehand
    inlineskip : "adsbygoogle", // strings - separated by ", " - if matched in any inline scripts - these are NOT are executed - set "inline" to true beforehand 
    style : true, // true = all style tags in the head loaded, false = style tags on target page ignored
    prefetch : true, // Plugin pre-fetches pages on hoverIntent or touchstart
 
// debugging & advanced settings
    verbosity : 0,  //Debugging level to console: 1 = medium, 2 = verbose
    memoryoff : false, // strings - separated by ", " - if matched in any URLs - only these are NOT executed - set to "true" to disable memory completely
    cb : null, // callback handler on completion of each Ajax request - default null
    pluginon : true // Plugin set "on" or "off" (==false) manually
}

Animation parameters (aniParams):  Default is false (set off)
{
    opacity: 1, //no fade, set to 0 for maximum fade
    width: "100%", //in percent -  "100%" means no change
    height: "100%" //in percent -  "100%" means no change
}

More animation parameters

You can specify any parameters that are understood by .animate() respectively…

*/

 //Intuitively better understandable shorthand for String.indexOf() - String.iO()
String.prototype.iO = function(s) { return this.toString().indexOf(s) + 1; };

//Minified hoverIntent plugin
(function(a){a.fn.hoverIntent=function(w,e,b){var j={interval:100,sensitivity:7,timeout:0};if(typeof w==="object"){j=a.extend(j,w);}else{if(a.isFunction(e)){j=a.extend(j,{over:w,out:e,selector:b});}else{j=a.extend(j,{over:w,out:w,selector:e});}}var x,d,v,q;var m=function(c){x=c.pageX;d=c.pageY;};var g=function(c,f){f.hoverIntent_t=clearTimeout(f.hoverIntent_t);if(Math.abs(v-x)+Math.abs(q-d)<j.sensitivity){a(f).off("mousemove.hoverIntent",m);f.hoverIntent_s=1;return j.over.apply(f,[c]);}else{v=x;q=d;f.hoverIntent_t=setTimeout(function(){g(c,f);},j.interval);}};var p=function(f,c){c.hoverIntent_t=clearTimeout(c.hoverIntent_t);c.hoverIntent_s=0;return j.out.apply(c,[f]);};var k=function(c){var h=jQuery.extend({},c);var f=this;if(f.hoverIntent_t){f.hoverIntent_t=clearTimeout(f.hoverIntent_t);}if(c.type=="mouseenter"){v=h.pageX;q=h.pageY;a(f).on("mousemove.hoverIntent",m);if(f.hoverIntent_s!=1){f.hoverIntent_t=setTimeout(function(){g(h,f);},j.interval);}}else{a(f).off("mousemove.hoverIntent",m);if(f.hoverIntent_s==1){f.hoverIntent_t=setTimeout(function(){p(h,f);},j.timeout);}}};return this.on({"mouseenter.hoverIntent":k,"mouseleave.hoverIntent":k},j.selector);};})(jQuery);

//Minified idle plugin
(function(n){n.fn.idle = function(e) {var i,t,o={idle:6e4,events:"mousemove keypress mousedown touchstart",onIdle:function(){},onActive:function(){},onHide:function(){},onShow:function(){},keepTracking:!1},c=!1,u=!0,d=n.extend({},o,e);return i=function(n,e){return c&&(e.onActive.call(),c=!1),(e.keepTracking?clearInterval:clearTimeout)(n),t(e);}, t = function(n) {var e,i=n.keepTracking?setInterval:setTimeout;return(e=i(function(){c=!0;n.onIdle.call();},n.idle)),e;},this.each(function(){var o=t(d);return n(this).on(d.events,function(){o=i(o,d);}),(e.onShow||e.onHide)&&n(document).on("visibilitychange webkitvisibilitychange mozvisibilitychange msvisibilitychange",function() {return document.hidden||document.webkitHidden||document.mozHidden||document.msHidden?u&&(u=!1,d.onHide.call()):u||(u=!0,d.onShow.call());});});};})(jQuery);

//Module global variables
var l = 0, pass = 0, currentURL = '', rootUrl = getRootUrl(), api = window.history && window.history.pushState && window.history.replaceState,

//Regexes for escaping fetched HTML of a whole page - best of Baluptons Ajaxify
//Makes it possible to pre-fetch an entire page
docType = /<\!DOCTYPE[^>]*>/i,
tagso = /<(html|head|body|title|meta|script|link)([\s\>])/gi,
tagsc = /<\/(html|head|body|title|meta|script|link)\>/gi,

//Helper strings
div12 = '<div class="ajy-$1"$2',
linki = '<link rel="stylesheet" type="text/css" href="*" />',
scri = '<script type="text/javascript" src="*" />',
linkr = 'link[href*="!"]', 
scrr = 'script[src*="!"]';

//Minified pO() function
function getParamNames(){return funStr.slice(funStr.indexOf("(")+1,funStr.indexOf(")"))}function JSON2Str(n,r){var t="var ",e=0;for(var i in n)if(n.hasOwnProperty(i)){var a=n[i];t+=e?",\n":"",t+="function"==typeof a?"_"+i+" = "+a.toString():i+" = "+(r?'settings["':"")+(r?i+'"]':JSON.stringify(a)),e++}return t+";"}function pO(n,r,t,e,i,a){var s="",o="",p="",f="",c="",u="",l=!1,g=!1,S=mbp;if(!n||!e)return void alert("Error in pO(): Missing parameter");if(funStr=e.toString(),s=n.substr(0,1).toUpperCase()+n.substr(1,n.length-1),c=getParamNames(e),l=c.iO("$this"),g=c.iO("options"),u=c.replace("$this, ",""),u="$this"==c?"":u,t&&!g&&(u+=""===u?"options":", options"),r&&(o=JSON2Str(r)),t&&(p="var settings = $.extend("+JSON.stringify(t)+", options);\n",p+=JSON2Str(t,1)),i&&(f=JSON2Str(i)),t||(S=S.replace(/\(options/g,"(")),l||(S=S.replace("var $this = $(this);","")),S=S.replace(/fnn/g,l?"fn."+n:n).replace(/Name/g,s).replace("funStr",funStr).replace("pVars",o).replace("pSettings",p).replace("pFns",f).replace("args",c).replace("arg0",u),!a)try{jQuery.globalEval(S)}catch(v){alert("Error : "+v+" | "+S)}}var funStr,mbp="(function ($) { var Name = function(options){ \npVars \npSettings \n this.a = funStr; \npFns }; \n$.fnn = function(arg0) {var $this = $(this); \nif(!$.fnn.o) $.fnn.o = new Name(options); \nreturn $.fnn.o.a(args);}; \n})(jQuery);";pO("log",0,{verbosity:0},function(n){l<verbosity&&console&&console.log(n)});

//getRootUrl() from Baluptons history.js
function getRootUrl(){var a=window.location.protocol+"//"+(window.location.hostname||window.location.host);if(window.location.port||!1)a+=":"+window.location.port;return a+="/",a;}

// The stateful Cache plugin
// Usage: 
// 1) $.cache() - returns currently cached page
// 2) $.cache(<URL>) - returns page with specified URL
// 3) $.cache(<jQuery object>) - saves the page in cache
pO("cache", { d: false }, 0, function (o) {
    if (!o) {
        return d;
    }
    if (typeof o === "string") {
        if(o === "f") { 
            $.pages("f");
            $.log("Cache flushed");
        } else d = $.pages($.memory(o));
        
		return d;
    }

    if (typeof o === "object") {
        d = o;
        return d;
    }
});

// The stateful Memory plugin
// Usage: $.memory(<URL>) - returns the same URL if not turned off internally
pO("memory", { d: false }, { memoryoff: false }, function (h) {
     d = memoryoff;
     if (!h || d === true) return false;
     if (d === false) return h;
     if (d.iO(", ")) {
          d = d.split(", ");
          if (d.iO(h)) return false;
          else return h;
     }
     
	 return h == d ? false : h;
});
		
// The stateful Pages plugin
// Usage: 
// 1) $.pages(<URL>) - returns page with specified URL from internal array
// 2) $.pages(<jQuery object>) - saves the passed page in internal array
// 3) $.pages(false) - returns false
pO("pages", { d: [] }, 0, function (h) {
    if (typeof h === "string") {
    if(h === "f") d = [];
    else for (var i = 0; i < d.length; i++)
        if (d[i][0] == h) return d[i][1];
    }
	
    if (typeof h === "object") {
        d.push(h);
    }
    
	if (typeof h === "boolean") {
        return false;
    }
});

// The GetPage plugin
// First parameter is a switch: 
// empty - returns cache
// <URL> - loads HTML via Ajax
// "+" - pre-fetches page
// "-" - loads page into DOM and handle scripts
// "x" - returns XHR
// otherwise - returns selection of current page to client

pO("getPage", { xhr: 0 }, 0, function (o, p, p2) { 
    if (!o) return $.cache();
	if (o.iO("/")) return _lPage(o, p);
    if (o === "+") return _lPage(p, p2, true);
    if (o === "-") return _lSel(p);
    if (o === "x") return xhr;            
    if($.cache()) return $.cache().find(".ajy-" + o);
}, {
    lSel: function ($t) { //load page into DOM and handle scripts
        pass++;
        _lDivs($t);
        $.scripts($.rq("s"));
        $.scripts("s");
        $.scripts("a");
        return $.scripts("c");
    },
		
    lPage: function (h, p, pre) { //fire Ajax load, check for hash first
         if (h.iO("#")) h = h.split("#")[0];
         if ($.rq("is") || !$.cache(h)) return _lAjax(h, p, pre);
         if(p) p();
    },
		
	ld: function ($t, $h) {
        $h.find(".ajy-script").each(function(){
            //if(!($(this).attr("src"))) $(this).replaceWith('<script type="text/javascript">' + $(this).text() + '</script>');
            if(!($(this).attr("src"))) $(this).replaceWith('');
            else $(this).replaceWith(scri.replace('*', $(this).attr("src")));
        });
            
        $t.html($h.html());
    },
		
    lDivs: function ($t) { //load target divs into DOM
        if ($.cache()) $t.each(function () { 
            _ld($(this), $.cache().find("#" + $(this).attr("id")));
        });
    },
		
    lAjax: function (hin, p, pre) { //execute Ajax load
        var ispost = $.rq("is");
                
        xhr = $.ajax({
		url: hin,
        type: ispost ? "POST" : "GET",
        data: ispost ? $.rq("d") : null,
        success: function (h) {
            if (!h || !_isHtml(xhr)) {
                if (!pre) location.href = hin;
            }
            
            $.cache($(_parseHTML(h)));
            $.pages([hin, $.cache()]);

            if(p) p();
        },
        error: function(jqXHR, status, error) {
        // Try to parse response text
            try { 
                $.log('Response text : ' + jqXHR.responseText);
                $.cache($(_parseHTML(jqXHR.responseText)));
                $.pages([hin, $.cache()]); 
                if(p) p(error);
            } catch (e) {}
        }
        });
    },
		
    isHtml: function (x) { //restrict interesting MIME types - only HTML / XML
        var d;
        return (d = x.getResponseHeader("Content-Type")), d && (d.iO("text/html") || d.iO("text/xml"));
    },
		
    parseHTML: function (h) { //process fetched HTML
        return $.trim(_replD(h));
    },
		
    replD: function (h) { //pre-process HTML so it can be loaded by jQuery
        return String(h).replace(docType, "").replace(tagso, div12).replace(tagsc, "</div>");
    }
}
);

// The main plugin - Ajaxify
// Is passed the global options 
// Checks for necessary pre-conditions - otherwise gracefully degrades
// Initialises sub-plugins
// Calls Pronto
var fn = jQuery.getPage; //fn is passed to Pronto as a jQuery sub-plugin, that is a callback

pO("ajaxify", 0, { pluginon: true, deltas: true }, function ($this, options) {
    var o = options;
    if(!o || typeof(o) !== 'string') {
        $(function () { //on DOMReady
            if (_init(settings)) { //sub-plugins initialisation
                $this.pronto(0, settings); //Pronto initialisation
                if(deltas) $.scripts("1"); //delta-loading initialisation
            }
        });
    }
        else return $().pronto(o);
    }, {
        init: function (s) {
            if (!api || !pluginon) return false;
            $.scripts("i", s);
            $.cache(0, s);
            $.memory(0, s);
            return true;
            }
        }
);

// The stateful Scripts plugin
// First parameter is switch:
// "i" - initailise options
// "a" - handle inline scripts
// "c" - fetch canonical URL
// otherwise - delta loading
pO("scripts", { $s : false }, { canonical: true, inline: true, inlinehints: false, inlineskip: "adsbygoogle", inlineappend: false, style: true }, function (o) {
    if (o === "i") {
        if(!$s) $s = $();
        return true;
    }
    if (o === "s") {
        return _allstyle($s.y);
    }
            
    if (o === "1") { 
        $.detScripts($s);
        return _addScripts(false, $s, settings);
    }
            
    if (o === "a") {
        return _alltxts($s.t);
    }

    if (o === "c") {
        if (canonical && $s.can) return $s.can.attr("href");
        else return false;
    }
    
    $.detScripts($s); //fetch all scripts
    _addScripts(o, $s, settings); //delta-loading
}, {
    allstyle: function ($s) {
        if (!style || !$s) return;
        $("head").find("style").remove();
        $s.each(function () {
            var d = $(this).text();
            _addstyle(d);
        });
    },
    alltxts: function ($s) {
        $s.each(function () {
             var d = $(this).text();
             if (!d.iO(").ajaxify(") && ((inline && !_inlineskip(d)) || $(this).hasClass("ajaxy") || _inlinehints(d))) _addtext(d);
        });
    },
    addtext: function (t) {
        if(inlineappend) return _apptext(t);
        
        try {
            $.globalEval(t);
        } catch (e1) {
	        try { 
                 eval(t);
            } catch (e2) {
                 $.log("Error in inline script : " + t + "\nError code : " + e2);
            }
        }
    },
    apptext: function (t) { 
        var scriptNode = document.createElement('script');
        scriptNode.appendChild(document.createTextNode(t));
        $.cd("g").get(0).appendChild(scriptNode);
    },
    addstyle: function (t) {
        $("head").append('<style type="text/css">' + t + '</style>');
    },
    inlineskip: function (txt) {
        var d = inlineskip;
        if (d) {
            d = d.split(", ");
            for (var i = 0; i < d.length; i++)
                if (txt.iO(d[i])) return true;
        }
    },
    inlinehints: function (txt) {
         var d = inlinehints;
         if (d) {
             d = d.split(", ");
             for (var i = 0; i < d.length; i++)
                 if (txt.iO(d[i])) return true;
         }
    },
    addScripts: function (same, $s, st) {
        $s.c.addAll(same, "href", st);
        $s.s.addAll(same, "src", st);
    }
}
);
// The DetScripts plugin - stands for "detach scripts"
// Works on "$s" jQuery object that is passed in and fills it
// Fetches all stylesheets in the head
// Fetches the canonical URL
// Fetches all external scripts on the page
// Fetches all inline scripts on the page
pO("detScripts", { head: 0, lk: 0, j: 0 }, 0, function ($s) {
    head = pass ? $.getPage("head") : $("head");
    lk = head.find(pass ? ".ajy-link" : "link");
    j = pass ? $.getPage("script") : $("script");
    $s.c = _rel(lk, "stylesheet");
    $s.y = head.find("style");
    $s.can = _rel(lk, "canonical");
    $s.s = j.filter(function () {
         return $(this).attr("src");
    });
    $s.t = j.filter(function () {
         return !($(this).attr("src"));
    })}, {
    rel: function(lk, v) {
        return $(lk).filter(function () {
             return $(this).attr("rel").iO(v);
        })}
    }
);

pO("addAll", { $scriptsO: false, $scriptsN: false, $sCssO: [], $sCssN: [], $sO: [], $sN: [] }, { deltas: true }, function ($this, same, PK) {
    if(!$this.length) return;
    if (PK == "href") {
        $scriptsO = $sCssO;
        $scriptsN = $sCssN;
    } else {
        $scriptsO = $sO;
        $scriptsN = $sN;
    } 
    if (_allScripts($this, PK)) return true;
    if (same) { _classAlways($this, PK); return; }
    $scriptsN = [];
    _newArray($this, $scriptsN, $scriptsO, PK);
    if (pass) {
         _findCommon($scriptsO, $scriptsN);
         _freeOld($scriptsO, PK);
         _sameScripts($scriptsN, PK);
         $scriptsO = $scriptsN.slice();
    }
    if (PK == "href") {
         $sCssO = $scriptsO;
         $sCssN = $scriptsN;
    } else {
         $sO = $scriptsO;
         $sN = $scriptsN;
    }
    }, {
    allScripts: function ($t, PK) {
        if (deltas) return false;
        $t.each(function () {
             _iScript($(this)[0], PK);
        });
        
        return true;
    },
    classAlways: function ($t, PK) {
        $t.each(function () {
        if ($(this).attr("data-class") == "always") {
            _iScript($(this).attr(PK), PK);
        }
        });
    },
    sameScripts: function (s, PK) {
        for (var i = 0; i < s.length; i++)
             if (s[i][1] === 0) _iScript(s[i][0], PK);
    },
    iScript: function ($S, PK) {
        $("head").append((PK == "href" ? linki : scri).replace("*", $S));
    },
    newArray: function ($t, sN, sO, PK) {
        var d;
        $t.each(function () {
             d = [$(this).attr(PK), 0];
             sN.push(d);
             if (!pass) sO.push(d);
        });
    },
    findCommon: function (s, sN) {
        for (var i = 0; i < s.length; i++) {
             s[i][1] = 2;
             if (_findScript(s[i][0], sN)) s[i][1] = 1;
        }
    },
    findScript: function ($S, s) {
        if ($S)
        for (var i = 0; i < s.length; i++)
             if (s[i][0] == $S) {
                 s[i][1] = 1;
                 return true;
             }
    },
    freeOld: function (s, PK) {
        for (var i = 0; i < s.length; i++)
            if (s[i][1] == 2 && s[i][0]) _removeScript(s[i][0], PK);
    },
    removeScript: function ($S, PK) {
        $((PK == "href" ? linkr : scrr).replace("!", $S)).remove();
    }
    }
);

pO("cd", { cd: 0, aniTrue: 0, from: 0, cdwidth: 0 }, { aniParams: false, aniTime: 0 }, function (o, p) {
    if(!o) return;
    
    if(o === "g") return cd;

	if(o === "i") {
        cd = p.first();
        aniTrue = aniTime && aniParams;
        cdwidth = cd.width();
        if(!aniTrue) return;
		
        aniParams = $.extend({
            opacity: 1, // default - no fade
            width: "100%",
            height: "100%"
        }, aniParams);
		
		aniParams = $.extend({
            marginRight: cdwidth - aniParams.width
        }, aniParams);
		
        from = $.extend({}, aniParams);
		
        for(var key in from) {
            if (from.hasOwnProperty(key)) { 
                var keyval = cd.css(key), keyOval = from[key];

                if((key === "height") && keyOval.iO("%")) { 
                    keyval = 10000 / +keyOval.substr(0, keyOval.iO("%")-1) + "%";
                }

                from[key] = keyval;    
            }
        }     
    }
	
    if(!p) return;
	
	if(!aniTrue) { p(); return; }
	
    if (o === "1" || o === "2") {
		if(o === "1") cd.stop(true, true);
        cd.animate(o === "1" ? aniParams : from, aniTime, p);
    }
});

pO("slides", { sliding: false, timer: 0, currEl: 0, sp: 0 }, { idleTime: 0, slideTime: 0, menu: false, addclass: "jqhover" }, function (o) {
	if(!o) return;
	
	if (o === "i") { 
	    if(!idleTime) return;
			
        $(document).idle({
            onIdle: function(){
                _trigger("idle");
                if(sliding) return;                    
                sliding = true;
                _slide();
            },
            onActive: function(){
                _trigger("active");
                if(currEl) currEl.removeClass(addclass);
                clearInterval(timer);
                sliding = false;
            },
            idle: idleTime
        });     
    }
	
    //sp = o;
}, {
    slide: function() { 
        if(!sliding) return;
        timer = setInterval(_slide1, slideTime); 
    },
    slide1: function() { 
        if(!sliding) return;
        $().pronto(_nextLink());
    }, 
	nextLink: function() { 
        var wasPrev = false, firstValue = false, firstLink = false, nextLink = false, link;
        $(menu).each(function(i, v){ var el = $(this).parent();
            if(nextLink) return true;
            link = v.href;
            if(!_internal(link)) return;
            el.removeClass(addclass);
            if(!firstValue) firstValue = $(this).parent();
            if(!firstLink) firstLink = link;
            if(wasPrev) { 
                nextLink = link;
                currEl = el;
                el.addClass(addclass);
            }
            else if(currentURL == link) wasPrev = true;
        });
			
        if(!nextLink) { 
             firstValue.addClass(addclass);
             nextLink = firstLink;
             currEl = firstValue;
        }
		
        return nextLink;
    }
});

function _trigger(t, e){ jQuery(window).trigger('pronto.' + t, e); }
function _internal(url) { 
    if (!url) return false;
    if(typeof(url) === 'object') url = url.href;
    if (url==='') return true;
    return url.substring(0,rootUrl.length) === rootUrl || !url.iO(':');
}

function _root(u) {
    u = u.iO('?') ? u.split('?')[0] : u;
}
        
function _sameRoot(u1, u2) {
    return _root(u1) === _root(u2);
}

pO("rq", { ispost: 0, data: 0, same: 0 }, 0, function (o, p) {
    if(o === "i") {
        ispost = false;
        data = null;
        same = false;
        return;
	}
	
	if(o === "s") {
        if(p) same = p;
		return same;
	}
	
	if(o === "is") {
        if(p) ispost = p;
		return ispost;
	}
	
	if(o === "d") {
        if(p) data = p;
        return data;
	}
});

pO("frms", { fm: 0, divs: 0}, { forms: "form:not(.no-ajaxy)" }, function (o, p) {
    if (!forms || !o) return;
    
    if(o === "d") divs = p;
    if(o === "a") divs.find(forms).filter(function() {
        return _internal($(this).attr("action"));
    }).submit(function (q) {
        fm = $(q.target);
        if (!fm.is("form")) {
            fm = fm.filter("input[type=submit]").parents("form:first");
            if (fm.length === 0) {
                return true;
            }
        }
        
        p = _k();
        var g = "get",
        m = fm.attr("method");
        if (m.length > 0 && m.toLowerCase() == "post") g = "post";
        
        var h, a = fm.attr("action");
        if (a && a.length > 0) h = a;
        else h = currentURL; 
                
        $.rq("i");
        $.rq("s", _sameRoot(h, currentURL));
               
        if (g == "get") h = _b(h, p);
        else {
            $.rq("is", true);
            $.rq("d", p);
        }
        
        _trigger("submit", h);
        $().pronto({ href: h });
        return false;
    });
}, {
    k: function () {
        var o = fm.serialize();
        var n = $("input[name][type=submit]", fm);
        if (n.length === 0) return o;
        var p = n.attr("name") + "=" + n.val();
        if (o.length > 0) {
            o += "&" + p;
        } else {
            o = p;
        }
        
        return o;
    },
    b: function (m, n) {
        if (m.indexOf("?") > 0) {
            m = m.substring(0, m.indexOf("?"));
        }
        return m + "?" + n;
    }
});

(function ($) {
    var Pronto = function (options) {
        var requestTimer = null, $gthis;

        // Default Options
        var settings = $.extend({
            selector: "a:not(.no-ajaxy):not([target='_blank'])",
            requestDelay: 0,
            prefetch: true,
            previewoff: true,
            cb: 0
        }, options);

        //Shorthands
        var selector = settings.selector,
            requestDelay = settings.requestDelay,
            prefetch = settings.prefetch,
            previewoff = settings.previewoff,
            cb = settings.cb;
        
        // Main plugin function
        this.a = function ($this, h) {
            if(!h) {
                $gthis = $this;
                $.cd(0, 0, settings);
                $.frms(0, 0, settings);
                $.slides(0, settings);
                //$.slides($.pronto);
                $.cd("i", $gthis);
				_init_p();
                return $this;
            }
            if(typeof(h) === "object") { 
                _request(h.href);
                 return;
            }
            if(h.iO("/")) { 
                _request(h, true, true);
                 return 'OK';
            }
        };

        // Private Methods
        function _init_p() {
            settings.$body = $("body");
            currentURL = window.location.href; // Capture current url & state
            _saveState(); // Set initial state
            $(window).on("popstate", _onPop); //Set handler for popState
            if (prefetch) {
                $(selector).hoverIntent(_prefetch, _drain); //If "prefetch" option defined then set handler to "_prefetch" on hoverIntent
                $(selector).on("touchstart", _prefetch); //for touchscreens
            }
            
            settings.$body.on("click.pronto", selector, _click); //For real clicks set handler to _click()
            $.frms("d", $("body")); //Select forms in whole body
            $.frms("a"); //Ajaxify forms
            $.frms("d", $gthis); //Every further pass - select forms in content div(s) only
            $.slides("i"); //Init slideshow
        }
		
        //Dummy function for hoverIntent
        function _drain() {}

        //Prefetch target page on hoverIntent
        function _prefetch(e) {
            $.rq("i"); // Initialise request
            
            var link = e.currentTarget;
            
            //Validate link internal and not the same URL
            if (!_internal(link)) return false;
            if (currentURL == link.href) return false;
			
            var req2 = function () {
                if (previewoff === true) return false;
                if (!_isInDivs(link) && (previewoff === false || !$(link).closest(previewoff).length)) _click(e, true);
            };
            fn('+', link.href, req2);
        }

        function _isInDivs(link) {
            var is = false;
            $gthis.each(function () {
                if ($(link).parents("#" + $(this).attr("id")).length > 0) is = true;
            });
            
            return is;
        }

        // Handle link clicks
        function _click(e, mode) {
            var link = e.currentTarget;
            $.rq("i");
            if (_exoticKey(e) || !_internal(link)) return; // Ignore everything but normal click and internal URLs
            if (_hashChange(link)) { // Only the hash part has changed
                _saveState(); // Update state on hash change
                return true;
            }
            e.preventDefault();
            e.stopPropagation();
            if (currentURL == link.href) {
                _saveState();
            } else _request(e, mode);
        }

        // Request new url
        function _request(e, mode, notPush) {
            var href = typeof(e) !== "string" ? e.currentTarget.href : e;
            _trigger("request", e); // Fire request event
			var reqr = function (err) { //Callback - continue with _render()
                if (err) { 
                    $.log('Error : ' + err); 
                    _trigger("error", err); 
                }
                _render(e, !notPush, mode);
            };
			
            fn(href, reqr); //Call "fn" - handler of parent
            }

        function _render(e, doPush, mode) {
            if (requestTimer !== null) {
                clearTimeout(requestTimer);
                requestTimer = null;
            }
            
            _trigger("beforeload", e);
            
            requestTimer = setTimeout(function () {
                _render2(e, doPush, mode);
            }, requestDelay);
        }
		
        function _render2(e, doPush, mode) {
			$.cd("1", function () { _doRender(e, doPush, mode); });
        }

        // Save current state
        function _saveState() {
            history.replaceState({ // Update state
                url: currentURL
            }, "state-" + currentURL, currentURL);
        }

        // Handle back/forward navigation
        function _onPop(e) {
            $.rq("i");
            
            var data = e.originalEvent.state;
            
            // Check if data exists
            if (data !== null && data.url !== currentURL) {
                $.rq("s", _sameRoot(data.url, currentURL));
                _trigger("request", e); // Fire request event
                var req3 = function () { //Callback - continue with _render()
                    _render(e, false, false);
                };
                fn(data.url, req3); //Call "fn" - handler of parent, passing URL
            }
        }

        // Push new states to the stack on new url
        function _doPush(url, doPush) {
            currentURL = url;
            if (doPush) {
                history.pushState({
                    url: currentURL
                }, "state-" + currentURL, currentURL);
            } else {
                _saveState();
            }
        }

        // Render HTML
       function _doRender(e, doPush, mode) {
            var url, canURL; //Canonical URL
            url = typeof(e) !== "string" ? e.currentTarget.href || e.originalEvent.state.url : e;
            _trigger("load", e);  // Fire load event

            // Update DOM and fetch canonical URL - important for handling re-directs
            canURL = fn('-', $gthis);
            $('title').html(fn('title').html()); // Update title
            $.cd("2", function () { _doRender2(e, url, doPush, mode, canURL); });
       }

       function _doRender2(e, url, doPush, mode, canURL) {
            //Set current URL to canonical if no hash or parameters in current URL
            if (canURL && canURL != url && !url.iO('#') && !url.iO('?')) url = canURL;

            $.frms("a"); //Ajaxify forms
            
            //If hash in URL and hash not standalone at the end, animate scroll to it
            if (url.iO('#') && (url.iO('#') < url.length - 1) && mode !== true) {
                var $el = $('#' + url.split('#')[1]), scrollTop;
                if ($el.length) scrollTop = $el.offset().top;
                if (scrollTop !== false) $(window).scrollTop(scrollTop);
            }

            _doPush(url, doPush); // Push new states to the stack on new url
            _gaCaptureView(url); // Trigger analytics page view
            _trigger("render", e); // Fire render event
            if(cb) cb();
        }

        // Google Analytics support
        function _gaCaptureView(url) {
            url = '/' + url.replace(rootUrl,'');
            if (typeof window.ga !== 'undefined') window.ga('send', 'pageview', url);
        }

        /*function _diffHost(link) {
            return (window.location.protocol !== link.protocol || window.location.host !== link.host);
        }*/

        function _exoticKey(e) {
            return (e.which > 1 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey);
        }

        function _hashChange(link) {
            return (link.hash && link.href.replace(link.hash, '') === window.location.href.replace(location.hash, '') || link.href === window.location.href + '#');
        }
    };

    // Define Plugin
    $.fn.pronto = function (h, options) {
        var $this = $(this);
        if (!$.fn.pronto.o) $.fn.pronto.o = new Pronto(options);
        return $.fn.pronto.o.a($this, h);
    };
})(jQuery);

jQuery.log("Ajaxify loaded...", {verbosity: 2});
