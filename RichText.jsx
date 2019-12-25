// CURRENTLY SUPPORTED:
// <b>bold content</b>
// <i>italic content</i>
// <bi>bold italic content</bi>
// <empty> - used for empty data cells
// <break> - used to place linebreaks in a cell
// <dbreak> - used to place double breaks in a cell
// <font change_font=[new_font] size_mul=[size_multiplier]> - used to apply font changes to text within it
// <glyph name=[glyph_name]>
// glyphs in @here@ work too
// <cstyle="Strong">Apply an InDesign character style</cstyle>
// <pstyle="Paragraph Style 1">Apply an InDesign paragraph style</cstyle>
// <colorrgb value="r,g,b">apply an RGB color</color>
// <colorcmyk value="c,m,y,k">apply a CMYK color</color>
// <color name="name">apply a named color</color>

// NECESSARY GLYPH CONFIGURATION IN A CSV:
// 	name
//	image name/relative path (relative to the CSV file)
//	dimensions (in the unit of your document - recommend millimeters)
//	fit method
//	y offset

//@include "Utilities/Utilities.jsx"
//@include "Utilities/ErrorHandler.jsx"

var configFile = null;
var configFilePath = null;
var glyphConfig = null;


app.doScript(richText, ScriptLanguage.JAVASCRIPT, undefined, UndoModes.ENTIRE_SCRIPT, "Rich Text");

function richText() {
	resetErrorHistory();

	fontStyle();
	applyComplexStyles();
	replaceGlyphs();

	displayErrorReport(false);
}

function applyComplexStyles() {
	var doc = app.activeDocument;

	app.findObjectPreferences = app.changeGrepPreferences  = NothingEnum.NOTHING;
	app.findGrepPreferences.findWhat = "<font=.+?>.+?</font>";
	var f = doc.findGrep(true);
}

function fontStyle() {
	applyTextReplace("break", "\n");
	applyTextReplace("dbreak", "\n\n");
	applyTextReplace("empty", "");

	applySimpleStyle("b", "Bold");
	applySimpleStyle("i", "Italic");
	applySimpleStyle("bi", "Bold Italic");

	applyComplexStyle("font", applyFontChanges, true);
	applyComplexStyle("glyph", applyGlyphTags, false);	
	applyComplexStyle("cstyle", applyCharacterStyleChange, true);
	applyComplexStyle("pstyle", applyParagraphStyleChange, true);

	applyComplexStyle("colorrgb", applyColorRGB, true);
	applyComplexStyle("colorcmyk", applyColorCMYK, true);
	applyComplexStyle("color", applyNamedColor, true);
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
		try
		{
			f[i].fontStyle = fontStyle;
		}
		catch(err)
		{
			reportError('Error applying font style: ' + fontStyle);
		}

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

function retrieveGlyphConfigIfNecessary()
{
	if (configFile == null)
	{
		configFile = File.openDialog();
		if (configFile != null && configFile.exists)
		{
			configFilePath = configFile.path;

			try
			{
				glyphConfig = parseCSVWithFile(configFile);
			}
			catch(err)
			{
				reportError('Error parsing glyph config: ' + configFile.path);
				
				configFile = null;
				glyphConfig = null;
				configFilePath = null;
			}
		}
	}
}

function applyGlyphToSelection(selection, glyphName, glyphConfig, configFilePath)
{
	var name = glyphName;
	var glyphInfo = glyphInfoForName(glyphConfig, name);
	
	if (glyphInfo == null)
	{
		reportError('No glyph info found for glyph: ' + name);
		return;
	}

	var glyphPath = configFilePath + "/" + glyphInfo[1];
	var glyphFile = new File(glyphPath);
	
	if (glyphFile.exists) {
		// Create a rectangle to hold the glyph
		size = strToSizeArray(glyphInfo[2]);
		rect = selection.insertionPoints[0].rectangles.add( {geometricBounds:[0,0, size[0], size[1] ]} );
		rect.strokeWeight = 0;

		// Place the glyph inside the rectangle
		rect.place(glyphFile);

		// Set the fit options
		rect.fit(strToFitMethod(glyphInfo[3]));
		
		// Shift glyph by some offset
		rect.anchoredObjectSettings.anchorYoffset = Number(glyphInfo[4]);
		
		// Remove the regex
		selection.remove();
	}
	else {
		reportError('No glyph image found: ' + glyphInfo[1]);
	}
}

function replaceGlyphs() {
	var doc = app.activeDocument;	
	
	app.findObjectPreferences = app.changeGrepPreferences  = NothingEnum.NOTHING;
	app.findGrepPreferences.findWhat = "@.+?@";
	var f = doc.findGrep(true);
	
	if (f.length == 0)
		return;

	var rect = null;

	retrieveGlyphConfigIfNecessary();
	if (glyphConfig == null)
	{
		reportError('No glyph config specified');
		return;
	}

	for (i = 0; i < f.length; i++) {
		var glyphName = f[i].contents.replace(/@/g, "");
		applyGlyphToSelection(f[i], glyphName, glyphConfig, configFilePath);
	}

	app.findObjectPreferences = app.changeGrepPreferences  = NothingEnum.NOTHING;
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
	else
	{
		reportError('Invalid fit method: ' + str);
	}

	return FitOptions.PROPORTIONALLY;
}

function strToSizeArray(str)
{
	str = trim(str);
	elements = str.split(",");
	return [Number(elements[0]), Number(elements[1])];
}



function applyComplexStyle(tag, responseFunction, containsInnerElement)
{
	var doc = app.activeDocument;

	app.findObjectPreferences = app.changeGrepPreferences  = NothingEnum.NOTHING;

	var str = "(<" + tag + ".+?>)(.+?)" + "(</" + tag + ">)";
	
	if (!containsInnerElement)
	{
		str = "<" + tag + ".+?>";
	}

	var regEx = new RegExp(str);

	app.findGrepPreferences.findWhat = str;
	var f = doc.findGrep(true);

	for (var i = 0; i < f.length; ++i)
	{
		// Yank out parameters
		parameters = parseTagParameters(f[i].contents);

		// Call the response function with the parameters in a dictionary
		responseFunction(f[i], parameters);

		// Cut out the tags.
		var result = regEx.exec(f[i].contents);
		if (!containsInnerElement)
		{
			// Do nothing - it will be removed elsewhere
		}
		else if (result != null)
		{
			f[i].contents = result[2];
		}
	}

	app.findObjectPreferences = app.changeGrepPreferences  = NothingEnum.NOTHING;
}

function isQuote(character)
{
	return character == '"' || character == '”';	
}

function parseTagParameters(str)
{
	parameters = {};

	try
	{
		var started = false;
		var currentStr = "";
		var inQuote = false;
		var key = "";
		var value = "";

		for (var i = 0; i < str.length; ++i)
		{
			var c = str[i];
			if (c == '<')
			{
				// This is the beginning; ignore it
			}
			else if (c == '>')
			{
				// We're finished - wrap things up and return
				if (key.length > 0 && currentStr.length > 0)
				{
					value = currentStr;

					parameters[key] = value;
					return parameters;
				}
			}
			else if (isQuote(c))
			{
				inQuote = !inQuote;

				// If we were building something, the end of the quote is the end of
				// the thing.
				if (!inQuote)
				{
					value = currentStr;

					parameters[key] = value;
					
					key = "";
					value = "";
					currentStr = "";
				}
			}
			else if (c == ' ')
			{
				// Spaces don't necessarily mean much and can usually be ignored.
				// However, immediately after building a parameter, spaces mark the beginning
				// of the next one.
				// Also we don't care about much of anything until after the first space.
				started = true;

				if (inQuote)
				{
					currentStr += c;
				}

				if (key != currentStr && key.length > 0 && currentStr.length > 0 && !inQuote)
				{
					value = currentStr;

					parameters[key] = value;
					
					key = "";
					value = "";
					currentStr = "";
				}
			}
			else if (c == '=')
			{
				// We've finished creating the key; now we need to start working on the value
				key = currentStr;
				
				currentStr = "";
			}
			else if (started)
			{
				currentStr += c;
			}
		}
	}
	catch(err)
	{
		reportError('Error parsing markup: ' + str);
	}

	return parameters;
}

function applyFontChanges(selection, parameters)
{
	for(var key in parameters)
	{
		var value = parameters[key];

		if (key == "size_mul")
		{
			if (Number(value) > 0)
			{
				selection.pointSize *= Number(value);
			}
			else
			{
				reportError('Invalid font size multiplier: ' + value);
			}
		}
		else if (key == "size")
		{
			if (Number(value) > 0)
			{
				selection.pointSize = Number(value);
			}
			else
			{
				reportError('Invalid font size: ' + value);
			}
		}
		else if (key == "font_change")
		{
			try
			{
				selection.appliedFont = value;
			}
			catch(err)
			{
				reportError('Invalid font specified: ' + value);
			}
		}
		else if (key == "style")
		{
			try
			{
				selection.fontStyle = value;
			}
			catch(err)
			{
				reportError('Invalid font style specified: ' + value);
			}
		}
		else if (key == "color")
		{
			var newParameters = {"name": value};
			applyNamedColor(selection, newParameters);
		}
		else if (key == "colorrgb")
		{
			var newParameters = {"color": value};
			applyColorRGB(selection, newParameters);
		}
		else if (key == "colorcmyk")
		{
			var newParameters = {"color": value};
			applyColorRGB(selection, newParameters);
		}
	}
}

function applyGlyphTags(selection, parameters)
{
	for(var key in parameters)
	{
		var value = parameters[key];

		if (key == "name")
		{
			retrieveGlyphConfigIfNecessary();

			if (glyphConfig == null)
			{
				reportError('No glyph config specified');
				return;
			}

			applyGlyphToSelection(selection, value, glyphConfig, configFilePath);
		}
	}
}

function applyCharacterStyleChange(selection, parameters)
{
	for(var key in parameters)
	{
		var value = parameters[key];

		if (key == "name")
		{
			var style = characterStyleByName(app.activeDocument, value);
			if (style != null)
			{
				selection.appliedCharacterStyle = style;
			}
			else
			{
				reportError('No character style in project: ' + value);
			}
		}
	}
}

function applyParagraphStyleChange(selection, parameters)
{
	for(var key in parameters)
	{
		var value = parameters[key];

		if (key == "name")
		{
			var style = paragraphStyleByName(app.activeDocument, value);
			if (style != null)
			{
				selection.appliedParagraphStyle = style;
			}
			else
			{
				reportError('No paragraph style in project: ' + value);
			}
		}
	}
}

function applyNamedColor(selection, parameters)
{
	for(var key in parameters)
	{
		var value = parameters[key];

		if (key == "name")
		{
			var color = colorByName(app.activeDocument, value);

			if (color == null)
			{
				reportError('No named color in project: ' + value);
				return;
			}

			selection.fillColor = color;
		}
	}
}

function applyColorRGB(selection, parameters)
{
	for(var key in parameters)
	{
		var value = parameters[key];

		if (key == "color")
		{
			var colorName = "IDSS_ColorRGB_" + value;
			var color = colorByName(app.activeDocument, colorName);
			if (color == null)
			{
				var colorValue = value.split(',');

				if (colorValue == null || colorValue.length < 3)
				{
					reportError('Invalid RGB value specified: ' + value);
					return;
				}

				colorValue[0] = Number(colorValue[0]);
				colorValue[1] = Number(colorValue[1]);
				colorValue[2] = Number(colorValue[2]);
				if (colorValue.length == 4)
					colorValue[3] = Number(colorValue[3]);
				else
					colorValue[3] = 255;

				makeColor(app.activeDocument, colorName, ColorSpace.RGB, ColorModel.PROCESS, colorValue);

				newParameters = {"name":colorName};
				applyNamedColor(selection, newParameters);
			}
		}
	}
}

function applyColorCMYK(selection, parameters)
{
	for(var key in parameters)
	{
		var value = parameters[key];

		if (key == "color")
		{
			var colorName = "IDSS_ColorCMYK_" + value;
			var color = colorByName(app.activeDocument, colorName);
			if (color == null)
			{
				var colorValue = value.split(',');
				
				if (colorValue == null || colorValue.length > 4)
				{
					reportError('Invalid CMYK value specified: ' + value);
					return;
				}

				colorValue[0] = Number(colorValue[0]);
				colorValue[1] = Number(colorValue[1]);
				colorValue[2] = Number(colorValue[2]);
				colorValue[3] = Number(colorValue[3]);
				
				makeColor(app.activeDocument, colorName, ColorSpace.CMYK, ColorModel.PROCESS, colorValue);

				newParameters = {"name":colorName};
				applyNamedColor(selection, newParameters);
			}
		}
	}
}
