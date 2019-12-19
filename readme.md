# Support Scripts for InDesign
These are scripts developed largely to aid in board game development.

## Installation
Drop the entire folder into your InDesign script directory.

On Windows, this is:
C:\Users\<your_username>\AppData\Roaming\Adobe\InDesign\<version>\en_US\Scripts\Scripts Panel\

## Usage
- In InDesign, open the Scripts window (Windows -> Utilities -> Scripts)
- Navigate to the script you want to run; double click to execute it.

## RichText
For large projects, you'll want to write all your text in a spreadsheet and then import
that into InDesign. However, there's no built-in way to markup that text when
you want to make it bold or drop in glyphs. Previously this was a manual step you had to do
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
- Add manual newlines using a single `<break>` tag. Line breaks in a CSV will blow things up.
- Add manual double breaks using a `<dbreak>` tag.
- Designate an empty data cell using the `<empty>` tag, which will be replaced with empty text.

### Glyph Use:
To utilize glyphs, the script needs configuration information for each glyph.

By default, the script will ask for a configuration file that details glyph configuration.
An example file is contained in SupportScripts/Examples/RichText

For automation purposes this is non-ideal. Use the RichTextFullyAutomated script for this.
This script will look in your User folder for a file named indesign_richtext_config.csv
and use that file for configuration.

### Limitations:
- Nested tags are not supported.

### Roadmap:
- More robust glyph support
- Support for color change
- Support for simple font changes
- Support for applying arbitrary character styles
- More robust error handling