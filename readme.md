# Support Scripts for InDesign
These are scripts developed largely to aid in board game development.

## Installation
Drop the entire folder into your InDesign script directory.

On Windows, this is:
C:/Users/[your_username]/AppData/Roaming/Adobe/InDesign/[version]/en_US/Scripts/Scripts Panel/

If you open up the Scripts system in InDesign, you can find the exact folder easily:
- Windows -> Utilities -> Scripts
- Right click the 'User' folder
- Click 'Reveal in Explorer' (or Reveal in Finder)
- There will be a 'Scripts Panel' folder that the scripts should be placed in

## Usage
- In InDesign, open the Scripts window (Windows -> Utilities -> Scripts)
- Navigate to the script you want to run; double click to execute it.

## RichText
For large projects, you'll want to write all your text in a spreadsheet and then import
that into InDesign. However, there's no built-in way to markup that text when
you want to make it bold or drop in inline images (glyphs). Previously this was a manual step you had to do
after your import.

The RichText script seeks to change that: run the script over your files after
the spreadsheet import, and this script will apply markups to your text.

### Markup:
The markup language is similar to HTML, where you put tags around the content
you want to format, and the script will handle the formatting.

- Make text <b>bold</b> by putting it within `<b>bold</b>` tags
- Make text <i>italic</i> by putting it in `<i>italic</i>` tags
- Make text <b><i>bold & italic</i></b> by putting it in `<bi>bold italic</bi>` tags
- Drop in a @glyph@ by putting the glyph name within @ characters.
- You can also drop in glyphs using `<glyph name="glyph">` tags!
- Add manual newlines using a single `<break>` tag. Line breaks in a CSV will blow things up.
- Add manual double breaks using a `<dbreak>` tag.
- Designate an empty data cell using the `<empty>` tag, which will be replaced with empty text.
- Apply InDesign character styles using `<cstyle name="...">cstyle tags</cstyle>`
- Apply paragraph styles using `<pstyle name="...">pstyle tags</pstyle>`
- Three ways to change colors:
	- `<color name="..."></color>` - used a named color in your swatch
	- `<colorrgb value="r,g,b"></colorrgb>` - use an RGB color
	- `<colorcmyk="c,m,y,k"></colorcmyk>` - use a CMYK color
- The `<font>` tag is a catchall that has a lot of parameters you can set:
	- font_change - provide the name of a new font
	- size_mul - multiplier on the current font size
	- size - change the current font size to a fixed value
	- style - change the font style (ie: 'Bold', 'Italic', etc; options depend on the font)
	- color - change to a named color in your InDesign swatch
	- colorrgb - change to an RGB color
	- colorcmyk - change to a CMYK color
	- Example: `<font font_change="Arial" size_mul="2" style="Bold" colorrgb="255,0,0">Styled text here!</font>`

### Glyph Use:
To utilize images inlined in text (glyphs), the script needs configuration information for each glyph.

By default, the script will ask for a configuration file that details glyph configuration.
An example file is contained in SupportScripts/Examples/GlyphExamples

The columsn in the CSV:
- <b>name</b> - friendly name given to the glyph; this is the name you'll use in your InDesign doc when you want to drop it in.
- <b>path</b> - the path of the glyph *relative to the config file*. Full paths are currently not supported (and rarely what you really want for a big project).
- <b>size x,y</b> - the size of the glyph. This is in the units of your document (pixels, millimeters, picas, whatever). We recommend using millimeters.
- <b>fit style</b> - how the glyph fits in the frame if the above size isn't the same as the image size. Typically we recommend PROPORTIONALLY, which will fit the image within the frame while maintaining its aspect ratio. However, we support all InDesign fit styles.
- <b>yOffset</b> - how much the glyph should be shifted on the Y axis (up/down). This will depend on the glyph size and the font size. You'll probably have to play with this number a bit. 

### Limitations:
- Nested tags are not supported.
	- Use character styles coupled with the `<cstyle>` tag for really intricate changes. This is the most flexible/powerful, and the recommended workflow when something simple won't do.
	- The `<font>` tag can also change multiple attributes at once on a chunk of text, but it's limited to a fixed set of attributes.
	- Some nested tags *might* work, but support for this is spotty at best. Don't rely on it. The markup system was designed to make simple changes easy, but was never intended for super intricate changes.
- When using the b, i, and bi tags, you must ensure the font you're using has Bold, Italic and Bold Italic styles appropriately. Otherwise these tags will cause an error.

### Roadmap:
- More robust error handling

## Label Support
For large projects, sometimes you want to dynamically control visibility.
Most notably, you may want certain images to only be visible on certain items (example: you may
only want a Weapon symbol to show up on Attack cards). You'll want to specify this in
your data spreadsheet for easy changes.

InDesign doesn't have a mechanism to handle that.

The LabelSupport script is intended to aid in that need.

### Giving Names to Things
For objects that need to be referenced by the LabelSupport script,
those things need to be given names.

In InDesign, Windows -> Utilities -> Script Labels

Click on the thing you want to give a name to (a script label), and type
in the label you want to provide.

### Disabling Objects (Option 1)
In data, if you name your column v_[script_label], fill that column
with TRUE or FALSE - TRUE if the thing should remain, FALSE otherwise.

Then run the LabelSupport script and choose your CSV data file. Anything with the [script_label] label
that is set to FALSE in the data will be removed from the image.

### Disabling Objects (Option 2)
In data, name a column disabled_items.
For each entry that wants to disable (remove) items, add the label to that cell.
If you want to remove multiple items, separate their labels by commas.

Then run the LabelSupport script and choose your CSV data file. It will look at the comma-separated list
and remove anything matching that pattern.

### Limitations
The label support script assumes you have one page per data row in your spreadsheet.
It's not currently setup to handle more intricate layouts. 

## Overall Goals & Roadmap
My goal with these scripts is to facilitate an end-to-end export pipeline for
complicated board games with as little human interaction as possible. Take your
spreadsheets & InDesign layout files, hit a few buttons, and you have print-ready files.

Some things which I'd like to support, but are still under investigation:
- Providing project-level configuration where users don't have to manually choose files/folders when they want to do something.
- A mechanism for doing automatic data merges & running these scripts over multiple files.
- Layer handling, though layers are used much less frequently in InDesign.
- I know how I'd lay out my files, but I don't know how other people do it. I need more visibility into the workflows of other teams to adapt these scripts to meet their needs.