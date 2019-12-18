// CURRENTLY SUPPORTED:
// <b>bold content</b>
// <i>italic content</i>
// <bi>bold italic content</bi>

// IN THE WORKS:
// <font="font">change font</font>
// <font_size_mul="2">multiplier on current font size</font>
// <colorhex="HEX">apply a hex color</color>
// <color="name">apply a named color</color>
// <style="Strong">Apply an InDesign character style</style>
// <glyph="glyph_name"> - add a glyph

// NECESSARY GLYPH CONFIGURATION:
// Glyph
//	image name/relative path
//	dimensions
//	fit method
//	y offset


app.doScript(richText, ScriptLanguage.JAVASCRIPT, undefined, UndoModes.ENTIRE_SCRIPT, "Rich Text");

function richText() {
	fontStyle();
	applyComplexStyles();
	replaceGlyphs();
}

function applyComplexStyles() {
	var doc = app.activeDocument;

	app.findObjectPreferences = app.changeGrepPreferences  = NothingEnum.NOTHING;
	app.findGrepPreferences.findWhat = "<font=.+?>.+?</font>";
	var f = doc.findGrep(true);
}

function fontStyle() {
	applySimpleStyle("b", "Bold");
	applySimpleStyle("i", "Italic");
	applySimpleStyle("bi", "Bold Italic");	
}

function applySimpleStyle(tag, fontStyle)
{
	var doc = app.activeDocument;

	app.findObjectPreferences = app.changeGrepPreferences  = NothingEnum.NOTHING;

	var beginTag = "<" + tag + ">";
	var endTag = "</" + tag + ">";

	app.findGrepPreferences.findWhat = beginTag + ".+?" + endTag;
	var f = doc.findGrep(true);

	for (i = 0; i < f.length; i++)
	{
		f[i].fontStyle = fontStyle;
		f[i].contents = f[i].contents.replace(beginTag, "");
		f[i].contents = f[i].contents.replace(endTag, "");
	}

	app.findObjectPreferences = app.changeGrepPreferences  = NothingEnum.NOTHING;
}

function replaceGlyphs() {
	if(app.documents.length != 0) {
		var doc = app.activeDocument;	
		var folderPath = "C:/Users/bdsow/Desktop/HeyCutieEmoji";

		app.findObjectPreferences = app.changeGrepPreferences  = NothingEnum.NOTHING;
		app.findGrepPreferences.findWhat = "@.+?@";
		var f = doc.findGrep(true);
		
		var rect = null;

		for (i = 0; i < f.length; i++) {
			var name = f[i].contents.replace(/@/g, "");
			var file = new File(folderPath + "/" + name + ".png");
			
			if (file.exists) {
				// Create a rectangle to hold the glyph
				rect = f[i].insertionPoints[0].rectangles.add( {geometricBounds:[0,0, 5, 5 ]} );
				rect.strokeWeight = 0;

				// Place the glyph inside the rectangle
				rect.place(file);

				// Set the fit options
				// CONTENT_TO_FRAME - stretch
				// FILL_PROPORTIONALLY
				// PROPORTIONALLY - may end up w/whitespace depending on frame size & image size
				// FRAME_TO_CONTENT
				rect.fit (FitOptions.PROPORTIONALLY);
				
				// Shift glyph by some offset
				rect.anchoredObjectSettings.anchorYoffset = -1.3;
				
				// Remove the regex
				f[i].remove();
			}
			else {
				// Alert in some way
			}
		}
	
		app.findObjectPreferences = app.changeGrepPreferences  = NothingEnum.NOTHING;
	}
	else{
		alert("Please open a document and try again.");
	}	
}