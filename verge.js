/*!
 * verge        viewport utilities module
 * @link        verge.airve.com
 * @license     MIT
 * @copyright   2012 Ryan Van Etten
 * @version     1.6.1
 */

/*jslint browser: true, devel: true, node: true, passfail: false, bitwise: true
, continue: true, debug: true, eqeq: true, es5: true, forin: true, newcap: true
, nomen: true, plusplus: true, regexp: true, undef: true, sloppy: true, stupid: true
, sub: true, white: true, indent: 4, maxerr: 180 */

(function(root, name, definition) {// github.com/umdjs/umd
    if (typeof module != 'undefined' && module['exports']) {
        module['exports'] = definition(); // common|node|ender
    } else { root[name] = definition(); } // browser
}(this, 'verge', function() {

    var viewportW
      , viewportH
      , win = window
      , docElem = document.documentElement
      , Modernizr = win['Modernizr']
      , matchMedia = win['matchMedia'] || win['msMatchMedia']
      , mq = matchMedia ? function(mq) {
            return !!matchMedia.call(win, mq).matches;
        } : function() {
            return false;
        }
      , xports = {}
      , effins = {};

    xports['mq'] = !matchMedia && Modernizr && Modernizr['mq'] || mq;
    xports['matchMedia'] = matchMedia ? function() {
        // matchMedia must be binded to window
        return matchMedia.apply(win, arguments);
    } : function() {
        return new Boolean(false);
    };

    /** 
     * $.viewportW()   Get the viewport width. (layout viewport)
     * @since          1.0.0
     * @link           responsejs.com/labs/dimensions/#viewport
     * @link           quirksmode.org/mobile/viewports2.html
     * @return         {number}
     */
    xports['viewportW'] = viewportW = (function(win, docElem, mq) {
        var inner = win['innerWidth'];
        return inner > docElem['clientWidth'] && mq('(min-width:' + inner + 'px)') ? function() { 
            return win['innerWidth']; 
        } : function() {
            return docElem['clientWidth']; 
        };
    }(win, docElem, mq));

    /** 
     * $.viewportH()   Get the viewport height. (layout viewport)
     * @since          1.0.0
     * @link           responsejs.com/labs/dimensions/#viewport
     * @link           quirksmode.org/mobile/viewports2.html
     * @return         {number}
     */
    xports['viewportH'] = viewportH = (function(win, docElem, mq) {
        var inner = win['innerHeight'];
        return inner > docElem['clientHeight'] && mq('(min-height:' + inner + 'px)') ? function() {
            return win['innerHeight']; 
        } : function() {
            return docElem['clientHeight']; 
        };
    }(win, docElem, mq));
    
    /** 
     * $.scrollX()  Cross-browser version of window.scrollX
     * @since       1.0.0
     * @return      {number}
     */
    function scrollX() {
        return win.pageXOffset || docElem.scrollLeft; 
    }
    xports['scrollX'] = scrollX;

    /** 
     * $.scrollY()  Cross-browser version of window.scrollY
     * @since       1.0.0
     * @return      {number}
     */
    function scrollY() {
        return win.pageYOffset || docElem.scrollTop; 
    }
    xports['scrollY'] = scrollY;

    // The #verge is the amount of pixels to act as a cushion around the viewport. It can be
    // any number. If the verge is zero, then the inX/inY/inViewport methods are exact. If it
    // is 100, then those methods return true when for elements that are are in the viewport 
    // *or* near it, w/ *near* being defined as w/in 100 pixels outside the viewport edge.
    // Elems just outside the viewport are 'on the verge' of being scrolled to.

    /** 
     * $.rectangle()                 cross-browser element.getBoundingClientRect w/ optional 
     *                               verge parameter. (see #verge) Coords given by rectangle
     *                               are relative to the top-left corner of the viewport.
     * @since  1.0.0
     * @param  {Object|Array} el     native element or matched set (defaults to first elem)
     * @param  {number=}      verge  see #verge
     * @param  {*=}           nix    if `nix` is truthy, the `verge` amount resets to 0. The 
     *                               purpose of this is so that you can use $.rectangle more 
     *                               easily with iterators that use the v/i/o signature.
     * @return {Object|undefined}    object containing coords (`undefined` if `el` is invalid)
     */
    function rectangle(el, verge, nix) {
        var r, o;
        el = el && (el.nodeType ? el : el[0]); // isolate node
        if ( el && 1 === el.nodeType ) {
            verge = typeof verge == 'number' && verge && !nix ? verge : 0;
            r = el.getBoundingClientRect(); // read-only
            o = {};
            o['top']    = r['top'] - verge;
            o['left']   = r['left'] - verge;
            o['bottom'] = r['bottom'] + verge;
            o['right']  = r['right'] + verge;
            o['width']  = o['right'] - o['left']; // includes verge * 2
            o['height'] = o['bottom'] - o['top']; // includes verge * 2
        }
        return o;
    }
    xports['rectangle'] = rectangle;
    effins['rectangle'] = function(verge) {
        return rectangle(this, verge);
    };

    /**
     * $.inX()             Determine if an element is in the same section 
     *                     of the x-axis as the current viewport is.
     * @since   1.0.0
     * @param   {Object}   el
     * @param   {number=}  verge
     * @return  {boolean}
     */
    function inX(el, verge) {
        var r = rectangle(el, verge);
        return !!r && r.right >= 0 && r.left <= viewportW();
    }
    xports['inX'] = inX;

    /**
     * $.inY()             Determine if an element is in the same section 
     *                     of the y-axis as the current viewport is.
     * @since   1.0.0
     * @param   {Object}   el
     * @param   {number=}  verge
     * @return  {boolean}
     */
    function inY(el, verge) {
        var r = rectangle(el, verge);
        return !!r && r.bottom >= 0 && r.top <= viewportH();
    }
    xports['inY'] = inY;

    /**
     * $.inViewport()      Determine if an element is in the current viewport.
     * @since   1.0.0
     * @param   {Object}   el
     * @param   {number=}  verge
     * @return  {boolean}
     */
    function inViewport(el, verge) {
        // Equiv to `inX(el, verge) && inY(el, verge)` but just manually do both 
        // to avoid calling rectangle() twice. It gzips just as small like this.
        var r = rectangle(el, verge);
        return !!r && r.bottom >= 0 && r.right >= 0 && r.top <= viewportH() && r.left <= viewportW();
    }
    xports['inViewport'] = inViewport;

    // xports['fn'] = effins;
    return xports;

}));