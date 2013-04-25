# pixo_multislides.js
A slider/carousel system allowing user to place more than one slide per page.
This plugin is responsive and suits for desktop, tablet and mobile devices.
The width of slides fit to the container.

## Compatibility

### jQuery libraries

* jQuery 1.7.1+
* jQuery touchSwipe

### Desktop browsers

* Internet Explorer 7+
* Google Chrome
* Mozilla Firefox
* Safari
* Opera

### Tested on

* Windows 7
* Mac OS X 10.8
* iOS 6
* Android 4.2


## Usage

### Public functions

```javascript
/**
 * Initialization
 */
$('div#multislides').pixo_multislides(); 

/**
 * Animation from the current page to the new page
 * 
 * @param {int} New page index 
 * @param {int} Speed of the animation
 */
$('div#multislides').pixo_multislides('goto', [1, 150]);

/**
 * Enable or disable the autoplay
 * 
 * @param {bool} enable
 */
$('div#multislides').pixo_multislides('autoPlay', [true]);

/**
 * Display or hide the navigation
 * 
 * @param {bool} enable
 */
$('div#multislides').pixo_multislides('navigation', [true]);

/**
 * Enable or disable the swipe
 * 
 * @param {bool} enable
 */
$('div#multislides').pixo_multislides('swipe', [true]);
```

### Initialization options

```javascript

/**
 * Available options
 */
var options = {
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
	size: {							// Define device sizes to trigger changes coming from page parameters
		tablet: 1024,
		mobile: 480
	}
};

$('div#multislides').pixo_multislides(options); 

```

## Issues

* Swipe plugin doesn't work on touch devices if the item on which you start the swipe is a link.

## Licensing

Released under the MIT License
Copyright 2013, Alexis Mangin
http://opensource.org/licenses/MIT