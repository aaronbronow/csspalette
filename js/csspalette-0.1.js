var CSSP = {
	version: 0.1,
	ajax:{
		getCSSLinks:function(url){
			
		},
		getCSS:function(url){
			
		}
	}
};

/**
 * @constructor
 */
CSSP.Palette = function(){
	var colors = [],
		regex = new RegExp("(#([0-9A-Fa-f]{3,6}))|" +
		  "(aqua)|(black)|(blue)|(fuchsia)|" +
		  "(gray)|(green)|(lime)|(maroon)|" +
		  "(navy)|(olive)|(orange)|(purple)|" +
		  "(red)|(silver)|(teal)|(white)|(yellow)|" +
		  "(rgb(\s*\b([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\b\s*," +
		  "\s*\b([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\b\s*," +
		  "\s*\b([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\b\s*))|" +
		  "(rgb(\s*(\d?\d%|100%)+\s*,\s*(\d?\d%|100%)+\s*,\s*(\d?\d%|100%)+\s*\))", "gmi");;
	
	return {
		/**
		 * Pulls valid colors out of text
		 * @private
		 * @param {String} text String of text
		 * @returns match Array of matching strings
		 * @type String
		 */
		getHex:function(text) {
		    var match = text.match(regex);
		    if (match != null) {
		        return match;
		    } else {
		        return false;
		    }
		},
		/*
			Find all similar colors for every color in the array
			@param colors Array of colors
			@param threshold Int threshold value for similarity
			@return colors Array of colors with matches found
		*/
		findSimilar:function(colors, threshold) {
			var newColors = [];
			for (var c = 0; c < colors.length; c++) {
				if(colors[c]) {
					var color = colors[c].color;
					for (var comp = 0; comp < colors.length; comp++) {
						if (colors[comp]) {
							var compColor = colors[comp].color;
							if (comp !== c) { //dont compare itself
								if (color.toHex() !== compColor.toHex()) { //not the same color
									if (Math.abs(color.r - compColor.r) < threshold && Math.abs (color.g - compColor.g) < threshold && Math.abs(color.b - compColor.b) < threshold) { //check similarity
										if (!this.arrayContainsColor(colors[c].similar, colors[comp])) {	//check if similar color already added
											colors[c].similar.push(colors[comp]); //add to similar
										} 
										if (!this.arrayContainsColor(colors[comp].similar, colors[c])) {
											colors[comp].similar.push(colors[c]); //add back reference
										}
									}
								} else {
									colors[c].duplicates.push(colors[comp]); //same color, add as duplicate
									colors[comp].duplicates.push(colors[c]); //add back reference
								}	
							}
						}
					}
					//colors[c].similar.sort(sortColorsHsl);
					colors[c].similar = this.sortColorsRgb(colors[c].similar);
					newColors.push(colors[c]);
					colors[c] = false;
				}
			}
			return newColors;
		},
		/*
			Check if array contains a color
			@param array Array of colors to sort
			@param color Color to check
			@return boolean If array contains color
		*/
		arrayContainsColor:function(array, color) {
			for (var c = 0; c < array.length; c++) {
				if (array[c].color.toHex() === color.color.toHex()) {
					return true;
				}
			}
			return false;
		},
		/*
			Sort colors by primary color and then by intensity
			@param colors Array of colors to sort
		*/
		sortColorsRgb:function(colors) {
			var gray = [];
			var red = [];
			var green = [];
			var blue = [];
			for (var c = 0; c < colors.length; c++) {
				var color = colors[c].color; 
				if (color.s !== 0) {
					if (Math.abs(color.r - color.g) <  15 && Math.abs(color.g - color.b) < 15) {
						gray.push(colors[c]);
					} else {
						var max = Math.max(color.r, color.g);
						max = Math.max(max, color.b);
						if (max === color.r) { red.push(colors[c]); } 
						else if (max === color.g) { green.push(colors[c]); } 
						else if (max === color.b) { blue.push(colors[c]); }
					}
				} else {
					gray.push(colors[c]);
				}
			}

			gray.sort(function (a, b) { return a.color.br-b.color.br;	});
			red.sort(function (a, b) { return b.color.br-a.color.br; });
			green.sort(function (a, b) { return a.color.br-b.color.br; });
			blue.sort(function (a, b) { return b.color.br-a.color.br; });
			return gray.concat(red).concat(green).concat(blue);
		},
		/*
			Calculates the primary colors out of a list of colors by setting all similar and duplicate colors to non-primary.
			@param colors Array of colors
		*/
		calculatePrimary:function(colors) {
			colors.size = colors.length;
			for (var c = 0; c < colors.length; c++) {
				if (colors[c].primary) {
					var color = colors[c];
					for (var d = 0; d < colors[c].duplicates.length; d++) {
						if (colors[c].duplicates[d] !== colors[c]) {
							colors[c].duplicates[d].primary = false;
							colors.size--;
						}
					}
					for (var s = 0; s < colors[c].similar.length; s++) {
						if (colors[c].similar[s] !== colors[c]) {
							colors[c].similar[s].primary = false;
							colors.size--;
							for (var d = 0; d < colors[c].similar[s].duplicates.length; d++) {
								if (colors[c].similar[s].duplicates[d] !== colors[c].similar[s]) {
									colors[c].similar[s].duplicates[d].primary = false;
									colors.size--;
								}
							}
						}
					}
				}
			}
		},
		/*
			Sort colors by primary color and then by intensity
			@param colors Array of colors to sort
		*/
		sortColorsRgb:function(colors) {
			var gray = [];
			var red = [];
			var green = [];
			var blue = [];
			for (var c = 0; c < colors.length; c++) {
				var color = colors[c].color; 
				if (color.s !== 0) {
					if (Math.abs(color.r - color.g) <  15 && Math.abs(color.g - color.b) < 15) {
						gray.push(colors[c]);
					} else {
						var max = Math.max(color.r, color.g);
						max = Math.max(max, color.b);
						if (max === color.r) { red.push(colors[c]); } 
						else if (max === color.g) { green.push(colors[c]); } 
						else if (max === color.b) { blue.push(colors[c]); }
					}
				} else {
					gray.push(colors[c]);
				}
			}

			gray.sort(function (a, b) { return a.color.br-b.color.br;	});
			red.sort(function (a, b) { return b.color.br-a.color.br; });
			green.sort(function (a, b) { return a.color.br-b.color.br; });
			blue.sort(function (a, b) { return b.color.br-a.color.br; });
			return gray.concat(red).concat(green).concat(blue);
		}
	};
};


/**
 * @constructor
 */
CSSP.Color = function(color){
	/*
		Color class containing the RGBColor, an array of similar colors, an array of duplicates, and whether it is primary. 
		@param color RGBColor 
	*/

	this.color = color;
	this.similar = [];
	this.duplicates = [];
	this.primary = true;
};


// TODO adwb: this should be merged with CSSP.Color
/**
 * @constructor
 */
CSSP.RGBColor = function(color_string)
{
    this.ok = false;
	
	//convert rgb to hsl
	this.toHsl = function (r, g, b) {
		r /= 255, g /= 255, b /= 255;
		var max = Math.max(r, g, b), min = Math.min(r, g, b);
		var h, s, l = (max + min) / 2;

		if(max == min){
			h = s = 0; // achromatic
		}else{
			var d = max - min;
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
			switch(max){
				case r: h = (g - b) / d + (g < b ? 6 : 0); break;
				case g: h = (b - r) / d + 2; break;
				case b: h = (r - g) / d + 4; break;
			}
			h /= 6;
		}

		return [h, s, l];
	}

    // strip any leading #
    if (color_string.charAt(0) == '#') { // remove # if any
        color_string = color_string.substr(1,6);
    }

    color_string = color_string.replace(/ /g,'');
    color_string = color_string.toLowerCase();

    // before getting into regexps, try simple matches
    // and overwrite the input
    var simple_colors = {
        aliceblue: 'f0f8ff',
        antiquewhite: 'faebd7',
        aqua: '00ffff',
        aquamarine: '7fffd4',
        azure: 'f0ffff',
        beige: 'f5f5dc',
        bisque: 'ffe4c4',
        black: '000000',
        blanchedalmond: 'ffebcd',
        blue: '0000ff',
        blueviolet: '8a2be2',
        brown: 'a52a2a',
        burlywood: 'deb887',
        cadetblue: '5f9ea0',
        chartreuse: '7fff00',
        chocolate: 'd2691e',
        coral: 'ff7f50',
        cornflowerblue: '6495ed',
        cornsilk: 'fff8dc',
        crimson: 'dc143c',
        cyan: '00ffff',
        darkblue: '00008b',
        darkcyan: '008b8b',
        darkgoldenrod: 'b8860b',
        darkgray: 'a9a9a9',
        darkgreen: '006400',
        darkkhaki: 'bdb76b',
        darkmagenta: '8b008b',
        darkolivegreen: '556b2f',
        darkorange: 'ff8c00',
        darkorchid: '9932cc',
        darkred: '8b0000',
        darksalmon: 'e9967a',
        darkseagreen: '8fbc8f',
        darkslateblue: '483d8b',
        darkslategray: '2f4f4f',
        darkturquoise: '00ced1',
        darkviolet: '9400d3',
        deeppink: 'ff1493',
        deepskyblue: '00bfff',
        dimgray: '696969',
        dodgerblue: '1e90ff',
        feldspar: 'd19275',
        firebrick: 'b22222',
        floralwhite: 'fffaf0',
        forestgreen: '228b22',
        fuchsia: 'ff00ff',
        gainsboro: 'dcdcdc',
        ghostwhite: 'f8f8ff',
        gold: 'ffd700',
        goldenrod: 'daa520',
        gray: '808080',
        green: '008000',
        greenyellow: 'adff2f',
        honeydew: 'f0fff0',
        hotpink: 'ff69b4',
        indianred : 'cd5c5c',
        indigo : '4b0082',
        ivory: 'fffff0',
        khaki: 'f0e68c',
        lavender: 'e6e6fa',
        lavenderblush: 'fff0f5',
        lawngreen: '7cfc00',
        lemonchiffon: 'fffacd',
        lightblue: 'add8e6',
        lightcoral: 'f08080',
        lightcyan: 'e0ffff',
        lightgoldenrodyellow: 'fafad2',
        lightgrey: 'd3d3d3',
        lightgreen: '90ee90',
        lightpink: 'ffb6c1',
        lightsalmon: 'ffa07a',
        lightseagreen: '20b2aa',
        lightskyblue: '87cefa',
        lightslateblue: '8470ff',
        lightslategray: '778899',
        lightsteelblue: 'b0c4de',
        lightyellow: 'ffffe0',
        lime: '00ff00',
        limegreen: '32cd32',
        linen: 'faf0e6',
        magenta: 'ff00ff',
        maroon: '800000',
        mediumaquamarine: '66cdaa',
        mediumblue: '0000cd',
        mediumorchid: 'ba55d3',
        mediumpurple: '9370d8',
        mediumseagreen: '3cb371',
        mediumslateblue: '7b68ee',
        mediumspringgreen: '00fa9a',
        mediumturquoise: '48d1cc',
        mediumvioletred: 'c71585',
        midnightblue: '191970',
        mintcream: 'f5fffa',
        mistyrose: 'ffe4e1',
        moccasin: 'ffe4b5',
        navajowhite: 'ffdead',
        navy: '000080',
        oldlace: 'fdf5e6',
        olive: '808000',
        olivedrab: '6b8e23',
        orange: 'ffa500',
        orangered: 'ff4500',
        orchid: 'da70d6',
        palegoldenrod: 'eee8aa',
        palegreen: '98fb98',
        paleturquoise: 'afeeee',
        palevioletred: 'd87093',
        papayawhip: 'ffefd5',
        peachpuff: 'ffdab9',
        peru: 'cd853f',
        pink: 'ffc0cb',
        plum: 'dda0dd',
        powderblue: 'b0e0e6',
        purple: '800080',
        red: 'ff0000',
        rosybrown: 'bc8f8f',
        royalblue: '4169e1',
        saddlebrown: '8b4513',
        salmon: 'fa8072',
        sandybrown: 'f4a460',
        seagreen: '2e8b57',
        seashell: 'fff5ee',
        sienna: 'a0522d',
        silver: 'c0c0c0',
        skyblue: '87ceeb',
        slateblue: '6a5acd',
        slategray: '708090',
        snow: 'fffafa',
        springgreen: '00ff7f',
        steelblue: '4682b4',
        tan: 'd2b48c',
        teal: '008080',
        thistle: 'd8bfd8',
        tomato: 'ff6347',
        turquoise: '40e0d0',
        violet: 'ee82ee',
        violetred: 'd02090',
        wheat: 'f5deb3',
        white: 'ffffff',
        whitesmoke: 'f5f5f5',
        yellow: 'ffff00',
        yellowgreen: '9acd32'
    };
    for (var key in simple_colors) {
        if (color_string == key) {
            color_string = simple_colors[key];
        }
    }
    // emd of simple type-in colors

    // array of color definition objects
    var color_defs = [
        {
            re: /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/,
            example: ['rgb(123, 234, 45)', 'rgb(255,234,245)'],
            process: function (bits){
                return [
                    parseInt(bits[1]),
                    parseInt(bits[2]),
                    parseInt(bits[3])
                ];
            }
        },
        {
            re: /^(\w{2})(\w{2})(\w{2})$/,
            example: ['#00ff00', '336699'],
            process: function (bits){
                return [
                    parseInt(bits[1], 16),
                    parseInt(bits[2], 16),
                    parseInt(bits[3], 16)
                ];
            }
        },
        {
            re: /^(\w{1})(\w{1})(\w{1})$/,
            example: ['#fb0', 'f0f'],
            process: function (bits){
                return [
                    parseInt(bits[1] + bits[1], 16),
                    parseInt(bits[2] + bits[2], 16),
                    parseInt(bits[3] + bits[3], 16)
                ];
            }
        }
    ];

    // search through the definitions to find a match
    for (var i = 0; i < color_defs.length; i++) {
        var re = color_defs[i].re;
        var processor = color_defs[i].process;
        var bits = re.exec(color_string);
        if (bits) {
            channels = processor(bits);
            this.r = channels[0];
            this.g = channels[1];
            this.b = channels[2];
			var hsl = this.toHsl(this.r, this.g, this.b); 
			this.h = hsl[0];
			this.s = hsl[1];
			this.l = hsl[2];
			this.br = this.r + this.g + this.b;
            this.ok = true;
        }

    }

    // validate/cleanup values
    this.r = (this.r < 0 || isNaN(this.r)) ? 0 : ((this.r > 255) ? 255 : this.r);
    this.g = (this.g < 0 || isNaN(this.g)) ? 0 : ((this.g > 255) ? 255 : this.g);
    this.b = (this.b < 0 || isNaN(this.b)) ? 0 : ((this.b > 255) ? 255 : this.b);

    // converts to rgb string rgb(000,000,000);
    this.toRgb = function () {
		var r = this.r + "";
		var g = this.g + "";
		var b = this.b + "";
		if (r.length == 1) r = "00" + r;
        if (g.length == 1) g = "00" + g;
        if (b.length == 1) b = "00" + b;
		
		if (r.length == 2) r = "0" + r;
        if (g.length == 2) g = "0" + g;
        if (b.length == 2) b = "0" + b;
        return 'rgb(' + r + ', ' + g + ', ' + b + ')';
    }
	
	// returns hex string #000000
    this.toHex = function () {
        var r = this.r.toString(16);
        var g = this.g.toString(16);
        var b = this.b.toString(16);
        if (r.length == 1) r = '0' + r;
        if (g.length == 1) g = '0' + g;
        if (b.length == 1) b = '0' + b;
        return '#' + r + g + b;
    }
};
