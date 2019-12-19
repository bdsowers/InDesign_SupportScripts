// CURRENTLY SUPPORTED:
// <b>bold content</b>
// <i>italic content</i>
// <bi>bold italic content</bi>
// <empty> - used for empty data cells
// <break> - used to place linebreaks in a cell
// <dbreak> - used to place double breaks in a cell

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

//@include "Utilities.jsx"

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

	applyTextReplace("break", "\n");
	applyTextReplace("dbreak", "\n\n");
	applyTextReplace("empty", "");	
}

function applyTextReplace(tag, changeCode)
{
	var doc = app.activeDocument;

	app.findObjectPreferences = app.changeGrepPreferences  = NothingEnum.NOTHING;

	var beginTag = "<" + tag + ">";
	
	app.findGrepPreferences.findWhat = beginTag;
	var f = doc.findGrep(true);

	for (i = 0; i < f.length; i++)
	{
		f[i].contents = changeCode;
	}

	app.findObjectPreferences = app.changeGrepPreferences  = NothingEnum.NOTHING;
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

function glyphInfoForName(glyphConfig, name)
{
	for (var row = 0; row < glyphConfig.length; ++row)
	{
		if (trim(glyphConfig[row][0]) == trim(name))
		{
			return glyphConfig[row];
		}
	}

	return null;	
}

function replaceGlyphs() {
	if(app.documents.length != 0) {
		var doc = app.activeDocument;	
		
		app.findObjectPreferences = app.changeGrepPreferences  = NothingEnum.NOTHING;
		app.findGrepPreferences.findWhat = "@.+?@";
		var f = doc.findGrep(true);
		
		if (f.length == 0)
			return;

		var rect = null;

		var configFile = File.openDialog();
		var configFilePath = configFile.path;
		var glyphConfig = parseCSVWithFile(configFile);

		for (i = 0; i < f.length; i++) {
			var name = f[i].contents.replace(/@/g, "");
			var glyphInfo = glyphInfoForName(glyphConfig, name);
			
			if (glyphInfo == null)
				continue;

			var glyphPath = configFilePath + "/" + glyphInfo[1];
			var glyphFile = new File(glyphPath);
			
			if (glyphFile.exists) {
				// Create a rectangle to hold the glyph
				size = strToSizeArray(glyphInfo[2]);
				rect = f[i].insertionPoints[0].rectangles.add( {geometricBounds:[0,0, size[0], size[1] ]} );
				rect.strokeWeight = 0;

				// Place the glyph inside the rectangle
				rect.place(glyphFile);

				// Set the fit options
				rect.fit(strToFitMethod(glyphInfo[3]));
				
				// Shift glyph by some offset
				rect.anchoredObjectSettings.anchorYoffset = Number(glyphInfo[4]);
				
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

function strToFitMethod(str)
{
	str = trim(str).toUpperCase();
	if (str == "PROPORTIONALLY")
	{
		return FitOptions.PROPORTIONALLY;
	}
	else if (str == "CONTENT_TO_FRAME")
	{
		return FitOptions.CONTENT_TO_FRAME;
	}
	else if (str == "FILL_PROPORTIONALLY")
	{
		return FitOptions.FILL_PROPORTIONALLY;
	}
	else if (str == "FRAME_TO_CONTENT")
	{
		return FitOptions.FRAME_TO_CONTENT;
	}
	else if (str == "CENTER_CONTENT")
	{
		return FitOptions.CENTER_CONTENT;
	}

	return FitOptions.PROPORTIONALLY;
}

function strToSizeArray(str)
{
	return [5,5];

	str = trim(str);
	elements = str.split(",");
	return [Number(elements[0]), Number(elements[1])];
}