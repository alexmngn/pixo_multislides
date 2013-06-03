/*
 * pixo.multislides.js
 * version 1.0b1
 * 
 * Copyright 2013, Alexis Mangin
 * http://www.pixostudio.net/
 * Github: https://github.com/pixostudio/
 * 
 * Released under the MIT License
 * http://opensource.org/licenses/MIT
 */

(function($) {
	
	$.pixo_multislides = function(el, options, args) {
		
		var pixo = this;
		var options = options;
		pixo.$el = $(el);
				
		var vars = {
			plugin: 'pixo_multislides',
			pages: {
				array: [],
				current: 0
			},
			slides: {
				array: [],
				displayed: 0
			},

			autoPlay: false,
			autoPlayInterval: null,
			swipe: false,
			isAnim: false
		};
		
		
		/**
		 * Private functions
		 */
		
		
		/**
		 * Constructor of the plugin.
		 */
		
		var init = function() {
			options = $.extend(true, {}, defaultOptions, options);			
			debug('Pixo Multislides: init()');

			if (!pixo.$el.hasClass(vars.plugin)) {
				pixo.$el.addClass(vars.plugin);
			}

			pixo.$el.find('> ul > li').each(function() {
				vars.slides.array.push($(this));
			});

			checkWrap();
			initNavigation();
			initSwipe();
			initEvents();
			resize();

			debug('----------');
			debug('Slides:');
			debug(vars.slides.array);
			debug('Pages:');
			debug(vars.pages.array);
			debug('----------');

		};

		/**
		 * Initialize events of the application: resize & navigation clicks
		 */
		
		var initEvents = function() {
			debug('Pixo Multislides: initEvents()');

			$(window).on('resize', resize);

			pixo.$el.on('click', 'a.multislides-nav-prev', function(event) {
				event.preventDefault();
				pixo.goto(vars.pages.current-1);
				return false;
			});
			pixo.$el.on('click', 'a.multislides-nav-next', function(event) {
				event.preventDefault();
				pixo.goto(vars.pages.current+1);
				return false;
			});
		};

		/**
		 * Add navigation arrows to the container
		 */
		
		var initNavigation = function() {
			debug('Pixo Multislides: initNavigation()');

			$('<a href="#" class="multislides-nav-prev"></a>').appendTo(pixo.$el);
			$('<a href="#" class="multislides-nav-next"></a>').appendTo(pixo.$el);
		};
			
		/**
		 * Initialize the touchSwipe plugin if is loaded
		 * It allows user to swipe left and right to change of page
		 */
		
		var initSwipe = function() {
			debug('Pixo Multislides: initSwipe()');
		
			if ($.fn.swipe) {
				var dir = null;
				var distancePrev = null;
				var distancePrev2 = null;
				pixo.$el.swipe({
					swipeStatus: function(event, phase, direction, distance, duration, fingers) {
						if (phase == 'move') {
							var page = null;

							if (direction == 'left') {
								page = checkPage(vars.pages.current+1);
								vars.pages.array[vars.pages.current].css('left', '-'+distance+'px');
								vars.pages.array[page].css('display', 'block').css('left', pixo.$el.width()-distance+'px');
							}
							if (direction == 'right') {
								page = checkPage(vars.pages.current-1);
								vars.pages.array[vars.pages.current].css('left', distance+'px');
								vars.pages.array[page].css('display', 'block').css('left', '-'+(pixo.$el.width()-distance)+'px');
							}
							if (dir != direction) {
								vars.pages.array[vars.pages.current].css('left', '0px');
								resize();
							}
							dir = direction;
						}

	
						if (phase == 'end') {

							var speed = null;
							if (distancePrev > pixo.$el.width()/5 && (distancePrev-distancePrev2) > pixo.$el.width()/25) {
								speed = 150;
							}

							if (direction == 'left') {
								pixo.goto(vars.pages.current+1, speed);
							}
							if (direction == 'right') {
								pixo.goto(vars.pages.current-1, speed);
							}
							return;
						}

						distancePrev2 = distancePrev;
						distancePrev = distance;

					},

					allowPageScroll:"vertical"
				});
				
				//Swipe hack to allow swipe on links
				pixo.$el.on('dragstart', 'a', function (e) {
					event.preventDefault();
					var mousedown = jQuery.Event('mousedown');
					mousedown.pageX = e.originalEvent.pageX;
					mousedown.pageY = e.originalEvent.pageY;
					pixo.$el.trigger(mousedown);
					return false;
				});
				
				pixo.$el.on('mouseleave', function (e) {
					pixo.$el.trigger('mouseup');
				});
				
				vars.swipe = true;
			}
		};

		/**
		 * Check if the plugin is a <ul> or a <div>. Add a wrapper if it's a <ul>.
		 */

		var checkWrap = function() {
			debug('Pixo Multislides: checkWrap()');
			if (pixo.$el.is('ul')) {
				pixo.$el = pixo.$el.wrap('div.'+vars.plugin);
			}
		};

		/**
		 * Get the device name depending of the size of the window
		 * 
		 * @returns {String} Device name: mobile, tablet or desktop
		 */

		var getDevice = function() {
			debug('Pixo Multislides: getDevice()');

			if ($(window).width() <= options.size.mobile) {
				return 'mobile';
			} else if ($(window).width() > options.size.mobile && $(window).width() <= options.size.tablet) {
				return 'tablet';
			}
			return 'desktop';
		};
		
		/**
		 * Function triggered by the resize event.
		 * Generate new pages if necessary.
		 * Enable or disable autoplay, navigation and swipe depending of the size of the window
		 */

		var resize = function() {
			debug('Pixo Multislides: resize()');

			stopGoto();
			var nslides = Math.floor(pixo.$el.width() / options.slides.minWidth);
			if (nslides > options.slides.maxDisplayed) {
				nslides = options.slides.maxDisplayed;
			}

			if (nslides != vars.slides.displayed) {
				generate(nslides);
			}

			for(key in vars.pages.array) {
				if (key != vars.pages.current) {
					var symbol = ((key < vars.pages.current) ? '-':'+');
					vars.pages.array[key].css('left', symbol+pixo.$el.width()+'px');
				}
			}

			var device = getDevice();
			pixo.autoPlay(options.pages[device].autoPlay.enable);
			pixo.navigation(options.pages[device].navigation.enable);
			pixo.swipe(options.pages[device].swipe.enable);

		};
		
		/**
		 * Check if the number of the page is consistent.
		 * If negative, return 0.
		 * If higher than the number of pages, return the last page
		 * 
		 * @param {int} page index
		 * @return {int} correct page index
		 */

		var checkPage = function(page) {
			debug('Pixo Multislides: checkPage('+page+')');

			if (page < 0) {
				page = vars.pages.array.length-1;
			} else if (page > vars.pages.array.length-1 || typeof page != "number") {
				page = 0;
			}
			return page;
		};
		
		/**
		 * Generate new pages
		 * 
		 * @param {int} Number of slides per page
		 */

		var generate = function(slides) {
			debug('Pixo Multislides: generate('+slides+')');

			pixo.$el.find('> ul').remove();

			var npages = Math.ceil(vars.slides.array.length/slides);
			if (npages <= vars.pages.current) {
				vars.pages.current = npages-1;
			}

			vars.pages.array = [];

			var ul = $('<ul></ul>');

			for (var key in vars.slides.array) {
				key = parseInt(key);

				vars.slides.array[key].width(Math.round(100/slides)-2+'%');
				ul.append(vars.slides.array[key]);

				if ((((key+1) % slides) === 0 || (key+1) === vars.slides.array.length)) {
					ul.css('left','0px').css('display', 'block').appendTo(pixo.$el);
					vars.pages.array.push(ul);
					if (vars.pages.array.length-1 != vars.pages.current) {
						vars.pages.array[vars.pages.array.length-1].css('display', 'none');
					}

					if (key != vars.slides.array.length-1) {
						ul = $('<ul></ul>');
					}
				}
			}	

			vars.slides.displayed = slides;
		};
		
		/**
		 * Stop page animation triggered by the function goto
		 */
			
		var stopGoto = function() {
			debug('Pixo Multislides: stopGoto()');
			pixo.$el.find('> ul').css('display', 'none').stop();
			vars.pages.current = checkPage(vars.pages.current);
			if (vars.pages.array[vars.pages.current] != undefined) {
				vars.pages.array[vars.pages.current].css('display', 'block').css('left', '0px');
			}
			vars.isAnim = false;
		};

		/**
		 * Debug console function
		 * 
		 * @param {mixed} log
		 */
		var debug = function(log) {
			if (options.debug == true) {
				console.log(log);
			}
		}
		
		/**
		 * Public functions
		 */
		
		
		/**
		 * Enable or disable the autoplay
		 * 
		 * @param {bool} enable
		 */

		pixo.autoPlay = function(enable) {
			debug('Pixo Multislides: autoPlay('+enable+')');

			if (enable == true && vars.autoPlay == false) {
				var delay = (options.pages[pixo.getDevice()].autoPlay.delay < options.pages.speed) ? 
							 options.pages.speed+50 : options.pages[pixo.getDevice()].autoPlay.delay;

				vars.autoPlayInterval = setInterval(function() {
					pixo.goto(vars.pages.current+1);
				}, delay);
			} else if (enable == false && vars.autoPlay == true) {
				clearInterval(vars.autoPlayInterval);
				vars.isAnim = false;
			}
			vars.autoPlay = enable;
		};
		
		/**
		 * Display or hide the navigation
		 * 
		 * @param {bool} enable
		 */

		pixo.navigation = function(enable) {
			debug('Pixo Multislides: navigation('+enable+')');

			if (enable == true) {
				pixo.$el.find('a[class*="multislides-nav"]').css('display', 'block');
			} else if (enable == false) {
				pixo.$el.find('a[class*="multislides-nav"]').css('display', 'none');
			}
		};
		
		/**
		 * Enable or disable the swipe
		 * 
		 * @param {bool} enable
		 */

		pixo.swipe = function(enable) {
			debug('Pixo Multislides: swipe('+enable+')');

			if (vars.swipe == true) {
				if (enable == true) {
					pixo.$el.swipe("enable");
				} else if (enable == false) {
					pixo.$el.swipe("disable");
				}
			} else if (enable == true) {
				debug('Pixo Multislides: swipe('+enable+'): Swipe library is not loaded');
			}
		};
		
		/**
		 * Animation from the current page to the new page
		 * 
		 * @param {int} New page index 
		 * @param {int} Speed of the animation
		 */
		
		pixo.goto = function(page, speed) {

			var symbol = ((page < vars.pages.current)? '-':'+');
			page = checkPage(page);
			debug('Pixo Multislides: goto('+page+', '+speed+')');

			if (!vars.isAnim && page != vars.pages.current) {

				vars.isAnim = true;
				var animateSpeed = (speed != undefined && speed != null) ? speed : ((Math.abs(parseInt(vars.pages.array[page].css('left')))*options.pages.speed)/pixo.$el.width());

				if (Math.abs(parseInt(vars.pages.array[page].css('left'))) >= pixo.$el.width()) {
					vars.pages.array[page].css('left', symbol+pixo.$el.width()+'px');
				}

				vars.pages.array[page].css('display', 'block').stop().animate({ 
					left: '0px' 
				}, 
				animateSpeed);
				vars.pages.array[vars.pages.current].stop().animate({
					left: ((symbol == '-')?'':'-')+pixo.$el.width()+'px'
				},
				animateSpeed, 
				function() {
					if (vars.isAnim == false) {
						stopGoto();
					} else {
						vars.pages.array[vars.pages.current].css('display', 'none');
						vars.pages.current = page;
						vars.isAnim = false;
					}
				});
			}
		};
		
		init();
		
	}
	
	/**
	 * Multislides default options 
	 */
		
	var defaultOptions = {
		
		debug: false,						// Enable/disable debug traces
		pages: {
			desktop: {						// Desktop size correspond to a screen width size "tablet" +1
				autoPlay: {					// Autoplay multislides with delay between pages
					enable: false,
					delay: 5000
				},
				navigation: {				// Display navigation arrows to change pages
					enable: true
				},
				swipe: {					// Using swipe to change pages
					enable: true
				}
			},
			tablet: {						// Tablet size correspond to a screen width size between "tablet" and "mobile" +1
				autoPlay: {
					enable: false,
					delay: 5000
				},
				navigation: {
					enable: true
				},
				swipe: {				
					enable: true
				}
			},
			mobile: {						// Mobile size correspond to a screen width equal or under the size "mobile"
				autoPlay: {
					enable: false,
					delay: 5000
				},
				navigation: {
					enable: false
				},
				swipe: {				
					enable: true
				}
			},

			speed: 500					// Animation speed between pages

		},
		slides: {
			minWidth: 230,				// Minimum width for a slide
			maxDisplayed: 4				// Maximum slides per page
		},
		size: {							// Define devices size to trigger changes coming from pages parameters
			tablet: 1024,
			mobile: 480
		}
	};
	
	
	$.fn.pixo_multislides = function(options, args) {
		
		return this.each(function() {
			if ($(this).data('multislides') != null && typeof options == 'string') {
				var m = $(this).data('multislides');
				if (m.pixo[options]) {
					m.pixo[options].apply(this, args);
				}
			} else {
				$(this).data('multislides', new $.pixo_multislides(this, options));
			}
		});

	};
	
})(jQuery);