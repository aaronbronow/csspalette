$(document).ready(function() {
	
	window.cssp.init();
	
	// 
	// JQUERY SETUP
	//
	
	$('#output').animate({
	    opacity: 0
	},	0);
	
	$.beautyOfCode.init(undefined, {
	    addControls: false
	});
	
	$("#code").beautifyCode('css');

	$('#input').keyup(function() {

    });

	$('#doneButton').click(function() {
		// TODO adwb: refactor this into a controller method
	    $('#output').animate({
	        opacity: 0
	    }, 0);
	
	    $('#output').html("");
	
	    var input = $('#input').val();
	
		window.cssp.loadPalette(input, function(palette){	
		    $('#output').animate({
		        opacity: 1
		    }, 500);
		    
			// animate
		    $('.syntaxhighlighter').empty();
		    $('.syntaxhighlighter').html(palette);
		    $(".syntaxhighlighter").beautifyCode('css');
		    
			// TODO adwb: this should be more OO and less QQ
			window.cssp.lines = $('.line');
			
			window.cssp.drawPalette();
		
		});
	
	});

	$('#rdio').click(function() {
		window.cssp.loadExample("rdio");
	});

});

window.cssp = {
	expanded:false,
	lines:null,
	palette:null,
	init:function(){
		// TODO adwb: instead of creating a single instance, create new Palettes as needed
		window.cssp.palette = new CSSP.Palette();
	},
	loadPalette:function(input, callback){
		// TODO adwb: determine if input is a url or css then call back with a real palette
		
		callback(input);
	},
	drawPalette:function(){
		// TODO adwb: pass a real palette into this method instead of iterating the #input elm
		var lines = document.getElementById("input").value.split("\n");
		var output = document.getElementById("output");

		var colors = [];
		var start = new Date().getTime();
		for (var i = 0; i < lines.length; i++) {
			var line = window.cssp.palette.getHex(lines[i]);
			if (line) {
				for (var c = 0; c < line.length; c++) { 
					var color = new CSSP.Color(new CSSP.RGBColor(line[c]));
					color.realValue = line[c];
					color.line = i + 1;
					colors.push(color);
				}
			}
		}

		//create similarity map for all colors
		colors = window.cssp.palette.findSimilar(colors, !isNaN(parseInt($('#threshold').val(), 10)) ? parseInt($('#threshold').val(), 10) : 0 );

		//find most relevant colors, excluding similar colors
		window.cssp.palette.calculatePrimary(colors);

		//sort if requested
		//if ($('#sort').is(':checked')) {  colors.sort(sortColorsHsl); }
		if ($('#sort').is(':checked')) {  colors = window.cssp.palette.sortColorsRgb(colors); }

		var ellapsed = new Date().getTime() - start;

		//display primay colors
		/*
			Display colors marked as primary
			@param colors Array of colors
		*/
		var displayedCount = function(){
			var count = 0;
			var size = colors.size / 9
			for (var c = 0; c < colors.length; c++) {
				if (colors[c].primary) {
					var out = document.createElement("div");
					var overlay = document.createElement("div");
					overlay.className = "overlay";
					out.appendChild(overlay);
					var color = colors[c].color.toRgb();
					out.style.backgroundColor = color;
					out.className = "color";
					$(out).tipTip({content: window.cssp.getDisplayHTML(colors[c])});
					output.appendChild(out);
					var lineNumber = colors[c].line;
					out.onmouseover = window.cssp.getMouseHandler(lineNumber);
					out.onmouseout = window.cssp.getMouseHandler(lineNumber, true);
					count++;
				}
			}
			return count;
		}(colors);

		var counts = document.createElement('div');
		counts.innerHTML = colors.length + " colors found, " + displayedCount + " colors shown" + " in "+ ellapsed + "ms<br/>";
		counts.style.marginLeft = "auto";
		counts.style.marginRight = "auto";
		output.insertBefore(counts, output.firstChild);
	},
	loadExample:function(exampleName){
		var example = '';
		
		switch (exampleName) {
		case 'rdio':
			example = CSSP.examples.rdio;
			break;
		default:
			example = "unknown";
		}
		
		// TODO adwb: move these into a controller method
		$('#input').val(example);
	    $('#doneButton').click();
	},
	/*
		Gets tooltip information and related colors html
		@param color Color to display
	*/
	getDisplayHTML:function(color) {
		var outputHTML = "";
		outputHTML += color.color.toHex() + " - " + color.color.toRgb() + "<br/>Occurrences: " + (color.duplicates.length + 1) + "<br/>" + "Similar: " + color.similar.length + "<br/>Line: " + color.line + "<br/>";

		if(color.similar.length > 0) {
			for (var c = 0; c < color.similar.length; c++) {
				outputHTML += '<div class="color" style="background-color:' + color.similar[c].color.toRgb() + ';"><div class="overlay"/></div>';
			} 
		} else {
			outputHTML += "No similar colors...";
		}
		return outputHTML;
	},
	getMouseHandler:function(line, out) {
		return function() { 
			window.cssp.lines[line-1].style.backgroundColor = out ? "" : "#f0ff00 !important";
			window.cssp.lines[line-1].scrollIntoView(true);
			if(window.cssp.lines[line-8]) {
				window.cssp.lines[line-8].scrollIntoView(true);
			}
		}
	}
};