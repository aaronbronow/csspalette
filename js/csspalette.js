var regex = new RegExp("(#([0-9A-Fa-f]{3,6}))|" +
  "(aqua)|(black)|(blue)|(fuchsia)|" +
  "(gray)|(green)|(lime)|(maroon)|" +
  "(navy)|(olive)|(orange)|(purple)|" +
  "(red)|(silver)|(teal)|(white)|(yellow)|" +
  "(rgb(\s*\b([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\b\s*," +
  "\s*\b([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\b\s*," +
  "\s*\b([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\b\s*))|" +
  "(rgb(\s*(\d?\d%|100%)+\s*,\s*(\d?\d%|100%)+\s*,\s*(\d?\d%|100%)+\s*\))", "gmi");
            
function getLines() {
	var lines = document.getElementById("input").value.split("\n");
	var output = document.getElementById("output");

	for (var i = 0; i < lines.length; i++) {
		var color = GetHex(lines[i]);
		if (color != false) {
			for(var j = 0; j < color.length; j++){
				var info = document.createElement("div");
			    info.appendChild(document.createTextNode(i+1));
			    info.className = "info";

			    var out = document.createElement("div");
			    //out.appendChild(document.createTextNode(color[0]));
			    out.style.backgroundColor = color[j];
			    out.className = "color";

			    //output.appendChild(info);
			    output.appendChild(out);
			}
		}
	}
}

function GetHex(text) {
    // var match = regex.exec(text);
	var match = text.match(regex);
    if (match != null) {
        return match;
    } else {
        return false;
    }
}