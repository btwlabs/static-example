/*global jQuery */
/*jshint browser:true */
/*!
* FitVids 1.1
*
* Copyright 2013, Chris Coyier - http://css-tricks.com + Dave Rupert - http://daverupert.com
* Credit to Thierry Koblentz - http://www.alistapart.com/articles/creating-intrinsic-ratios-for-video/
* Released under the WTFPL license - http://sam.zoy.org/wtfpl/
*
*/

;(function( $ ){

  'use strict';

  $.fn.fitVids = function( options ) {
    var settings = {
      customSelector: null,
      ignore: null
    };

    if(!document.getElementById('fit-vids-style')) {
      // appendStyles: https://github.com/toddmotto/fluidvids/blob/master/dist/fluidvids.js
      var head = document.head || document.getElementsByTagName('head')[0];
      var css = '.fluid-width-video-wrapper{width:100%;position:relative;padding:0;}.fluid-width-video-wrapper iframe,.fluid-width-video-wrapper object,.fluid-width-video-wrapper embed {position:absolute;top:0;left:0;width:100%;height:100%;}';
      var div = document.createElement("div");
      div.innerHTML = '<p>x</p><style id="fit-vids-style">' + css + '</style>';
      head.appendChild(div.childNodes[1]);
    }

    if ( options ) {
      $.extend( settings, options );
    }

    return this.each(function(){
      var selectors = [
        'iframe[src*="player.vimeo.com"]',
        'iframe[src*="youtube.com"]',
        'iframe[src*="youtube-nocookie.com"]',
        'iframe[src*="kickstarter.com"][src*="video.html"]',
        'object',
        'embed'
      ];

      if (settings.customSelector) {
        selectors.push(settings.customSelector);
      }

      var ignoreList = '.fitvidsignore';

      if(settings.ignore) {
        ignoreList = ignoreList + ', ' + settings.ignore;
      }

      var $allVideos = $(this).find(selectors.join(','));
      $allVideos = $allVideos.not('object object'); // SwfObj conflict patch
      $allVideos = $allVideos.not(ignoreList); // Disable FitVids on this video.

      $allVideos.each(function(){
        var $this = $(this);
        if($this.parents(ignoreList).length > 0) {
          return; // Disable FitVids on this video.
        }
        if (this.tagName.toLowerCase() === 'embed' && $this.parent('object').length || $this.parent('.fluid-width-video-wrapper').length) { return; }
        if ((!$this.css('height') && !$this.css('width')) && (isNaN($this.attr('height')) || isNaN($this.attr('width'))))
        {
          $this.attr('height', 9);
          $this.attr('width', 16);
        }
        var height = ( this.tagName.toLowerCase() === 'object' || ($this.attr('height') && !isNaN(parseInt($this.attr('height'), 10))) ) ? parseInt($this.attr('height'), 10) : $this.height(),
            width = !isNaN(parseInt($this.attr('width'), 10)) ? parseInt($this.attr('width'), 10) : $this.width(),
            aspectRatio = height / width;
        if(!$this.attr('id')){
          var videoID = 'fitvid' + Math.floor(Math.random()*999999);
          $this.attr('id', videoID);
        }
        $this.wrap('<div class="fluid-width-video-wrapper"></div>').parent('.fluid-width-video-wrapper').css('padding-top', (aspectRatio * 100)+'%');
        $this.removeAttr('height').removeAttr('width');
      });
    });
  };
// Works with either jQuery or Zepto
})( window.jQuery || window.Zepto );
;
/*
 * Sidr
 * https://github.com/artberri/sidr
 *
 * Copyright (c) 2013 Alberto Varela
 * Licensed under the MIT license.
 */

 ;(function( $ ){

  var sidrMoving = false,
  sidrOpened = false;

  // Private methods
  var privateMethods = {
    // Check for valids urls
    // From : http://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-an-url
    isUrl: function (str) {
      var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
        '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
      if(!pattern.test(str)) {
        return false;
      } else {
        return true;
      }
  },
    // Loads the content into the menu bar
    loadContent: function($menu, content) {
      $menu.html(content);
    },
    // Add sidr prefixes
    addPrefix: function($element) {
      var elementId = $element.attr('id'),
      elementClass = $element.attr('class');

      if(typeof elementId === 'string' && '' !== elementId) {
        $element.attr('id', elementId.replace(/([A-Za-z0-9_.\-]+)/g, 'sidr-id-$1'));
      }
      if(typeof elementClass === 'string' && '' !== elementClass && 'sidr-inner' !== elementClass) {
        $element.attr('class', elementClass.replace(/([A-Za-z0-9_.\-]+)/g, 'sidr-class-$1'));
      }
      $element.removeAttr('style');
    },
    execute: function(action, name, callback) {
      // Check arguments
      if(typeof name === 'function') {
        callback = name;
        name = 'sidr';
      }
      else if(!name) {
        name = 'sidr';
      }

      // Declaring
      var $menu = $('#' + name),
      $body = $($menu.data('body')),
      $html = $('html'),
      menuWidth = $menu.outerWidth(true),
      speed = $menu.data('speed'),
      side = $menu.data('side'),
      displace = $menu.data('displace'),
      onOpen = $menu.data('onOpen'),
      onClose = $menu.data('onClose'),
      bodyAnimation,
      menuAnimation,
      scrollTop,
      bodyClass = (name === 'sidr' ? 'sidr-open' : 'sidr-open ' + name + '-open');

      // Open Sidr
      if('open' === action || ('toggle' === action && !$menu.is(':visible'))) {
        // Check if we can open it
        if( $menu.is(':visible') || sidrMoving ) {
          return;
        }

        // If another menu opened close first
        if(sidrOpened !== false) {
          methods.close(sidrOpened, function() {
            methods.open(name);
          });

          return;
        }

        // Lock sidr
        sidrMoving = true;

        // Left or right?
        if(side === 'left') {
          bodyAnimation = {left: menuWidth + 'px'};
          menuAnimation = {left: '0px'};
        }
        else {
          bodyAnimation = {right: menuWidth + 'px'};
          menuAnimation = {right: '0px'};
        }

        // Prepare page if container is body
        if($body.is('body')){
          scrollTop = $html.scrollTop();
          $html.css('overflow-x', 'hidden').scrollTop(scrollTop);
        }

        // Open menu
        if(displace){
          $body.addClass('sidr-animating').css({
            width: $body.width(),
            position: 'absolute'
          }).animate(bodyAnimation, speed, function() {
            $(this).addClass(bodyClass);
          });
        }
        else {
          setTimeout(function() {
            $(this).addClass(bodyClass);
          }, speed);
        }
        $menu.css('display', 'block').animate(menuAnimation, speed, function() {
          sidrMoving = false;
          sidrOpened = name;
          // Callback
          if(typeof callback === 'function') {
            callback(name);
          }
          $body.removeClass('sidr-animating');
      });

        // onOpen callback
        onOpen();
    }
      // Close Sidr
      else {
        // Check if we can close it
        if( !$menu.is(':visible') || sidrMoving ) {
          return;
        }

        // Lock sidr
        sidrMoving = true;

        // Right or left menu?
        if(side === 'left') {
          bodyAnimation = {left: 0};
          menuAnimation = {left: '-' + menuWidth + 'px'};
        }
        else {
          bodyAnimation = {right: 0};
          menuAnimation = {right: '-' + menuWidth + 'px'};
        }

        // Close menu
        if($body.is('body')){
          scrollTop = $html.scrollTop();
          $html.removeAttr('style').scrollTop(scrollTop);
        }
        $body.addClass('sidr-animating').animate(bodyAnimation, speed).removeClass(bodyClass);
        $menu.animate(menuAnimation, speed, function() {
          $menu.removeAttr('style').hide();
          $body.removeAttr('style');
          $('html').removeAttr('style');
          sidrMoving = false;
          sidrOpened = false;
          // Callback
          if(typeof callback === 'function') {
            callback(name);
          }
          $body.removeClass('sidr-animating');
      });

        // onClose callback
        onClose();
    }
}
};

  // Sidr public methods
  var methods = {
    open: function(name, callback) {
      privateMethods.execute('open', name, callback);
    },
    close: function(name, callback) {
      privateMethods.execute('close', name, callback);
    },
    toggle: function(name, callback) {
      privateMethods.execute('toggle', name, callback);
    },
    // I made a typo, so I mantain this method to keep backward compatibilty with 1.1.1v and previous
    toogle: function(name, callback) {
      privateMethods.execute('toggle', name, callback);
    }
};

$.sidr = function( method ) {

  if ( methods[method] ) {
    return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
  }
  else if ( typeof method === 'function' || typeof method === 'string' || ! method ) {
    return methods.toggle.apply( this, arguments );
  }
  else {
    $.error( 'Method ' + method + ' does not exist on jQuery.sidr' );
  }

};

$.fn.sidr = function( options ) {

  var settings = $.extend( {
      name          : 'sidr',         // Name for the 'sidr'
      speed         : 200,            // Accepts standard jQuery effects speeds (i.e. fast, normal or milliseconds)
      side          : 'left',         // Accepts 'left' or 'right'
      source        : null,           // Override the source of the content.
      renaming      : true,           // The ids and classes will be prepended with a prefix when loading existent content
      body          : 'body',         // Page container selector,
      displace: true, // Displace the body content or not
      onOpen        : function() {},  // Callback when sidr opened
      onClose       : function() {}   // Callback when sidr closed
  }, options);

  var name = settings.name,
  $sideMenu = $('#' + name);

    // If the side menu do not exist create it
    if( $sideMenu.length === 0 ) {
      $sideMenu = $('<div />')
      .attr('id', name)
      .appendTo($('body'));
    }

    // Adding styles and options
    $sideMenu
    .addClass('sidr')
    .addClass(settings.side)
    .data({
      speed          : settings.speed,
      side           : settings.side,
      body           : settings.body,
      displace      : settings.displace,
      onOpen         : settings.onOpen,
      onClose        : settings.onClose
    });

    // The menu content
    if(typeof settings.source === 'function') {
      var newContent = settings.source(name);
      privateMethods.loadContent($sideMenu, newContent);
    }
    else if(typeof settings.source === 'string' && privateMethods.isUrl(settings.source)) {
      $.get(settings.source, function(data) {
        privateMethods.loadContent($sideMenu, data);
      });
    }
    else if(typeof settings.source === 'string') {
      var htmlContent = '',
      selectors = settings.source.split(',');

      $.each(selectors, function(index, element) {
        htmlContent += '<div class="sidr-inner">' + $(element).html() + '</div>';
      });

      // Renaming ids and classes
      if(settings.renaming) {
        var $htmlContent = $('<div />').html(htmlContent);
        $htmlContent.find('*').each(function(index, element) {
          var $element = $(element);
          privateMethods.addPrefix($element);
        });
        htmlContent = $htmlContent.html();
      }
      privateMethods.loadContent($sideMenu, htmlContent);
  }
  else if(settings.source !== null) {
    $.error('Invalid Sidr Source');
  }

  return this.each(function(){
    var $this = $(this),
    data = $this.data('sidr');

      // If the plugin hasn't been initialized yet
      if ( ! data ) {

        $this.data('sidr', name);

        if(settings.forceclick){
          $this.click(function(e) {
            e.preventDefault();
            methods.toggle(name);
          });
        }
        else{

          if('ontouchstart' in document.documentElement) {
            $this.bind('touchstart', function(e) {
              var theEvent = e.originalEvent.touches[0];
              this.touched = e.timeStamp;
            });
            $this.bind('touchend', function(e) {
              var delta = Math.abs(e.timeStamp - this.touched);
              if(delta < 200) {
                e.preventDefault();
                methods.toggle(name);
              }
            });
          }
          else {
            $this.click(function(e) {
              e.preventDefault();
              methods.toggle(name);
            });
          }
        }
      }
  });
};

})( jQuery );

;
(function($) {
    $(document).ready(function() {
        // Initialize Fit Vids
        $('.file-video').fitVids();

        // Initialize SIDR mobile menu
        $('#mobile-nav').sidr({
            name: 'sidr-main',
            source: '.region-nav #block-system-main-menu .content',
            side: 'right',
            displace: true,
            forceclick: true,
            // Disable body scrolling on open
            onOpen: function() {
                        console.log("MENU OPEN");
                        $('body').css({
                            'height': '100%',
                            'overflow': 'hidden'
                        });
                        $('#mobile-nav').addClass('close');
                    },
            // Re-enable body scrolling on close
            onClose: function() {
                        console.log("MENU OPEN");
                        $('body').css({
                            'height': 'auto',
                            'overflow': 'hidden'
                        });
                        $('#mobile-nav').removeClass('close');
                    }
        });

        // Togle the "close" class for the Mobile Menu Navicon
        var mobileOpen = false;


        // FESTIVAL LINEUP
        // var artistCount = 1;
        
        // $('#block-views-lineup-artists .views-row').each(function() {
        //     if(artistCount >= 1) {
        //         $(this).find('a').css('font-size', '3em');
        //     }
        //     if(artistCount > 3) {
        //         $(this).find('a').css('font-size', '2.33em');
        //     }
        //     if(artistCount > 7) {
        //         $(this).find('a').css('font-size', '1.75em');
        //     }
        //     if(artistCount > 12) {
        //         $(this).find('a').css('font-size', '1.5em');
        //     }
        //     if(artistCount > 20) {
        //         $(this).find('a').css('font-size', '1em');
        //     }
        //     artistCount ++;
        // });
    });
    
})(jQuery);;
