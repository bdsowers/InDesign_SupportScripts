# Support Scripts for InDesing
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
- <b>Make text bold by putting it in</b> tags
- <i>Make text italic by putting it in </i> tags
- <bi>Make text bold & italic by putting it in </bi> tags
- Drop in a @glyph@ by putting the glyph name within @ characters.

### Limitations:
- Nested tags are not supported.

### Roadmap:
- More robust glyph support
- Support for color change
- Support for simple font changes
- Support for applying arbitrary character styles

