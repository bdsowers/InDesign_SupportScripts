// Yanked from StackOverflow because we're in 2019 now and CSV parsing
// still is something you have to dig through solutions for...
// https://stackoverflow.com/questions/1293147/javascript-code-to-parse-csv-data

function csvStringToArray(str) {
    var arr = [];
    var quote = false;  // true means we're inside a quoted field

    // iterate over each character, keep track of current row and column (of the returned array)
    for (var row = 0, col = 0, c = 0; c < str.length; c++) {
        var cc = str[c], nc = str[c+1];        // current character, next character
        arr[row] = arr[row] || [];             // create a new row if necessary
        arr[row][col] = arr[row][col] || '';   // create a new column (start with empty string) if necessary

        // If the current character is a quotation mark, and we're inside a
        // quoted field, and the next character is also a quotation mark,
        // add a quotation mark to the current column and skip the next character
        if (cc == '"' && quote && nc == '"') { arr[row][col] += cc; ++c; continue; }  

        // If it's just one quotation mark, begin/end quoted field
        if (cc == '"') { quote = !quote; continue; }

        // If it's a comma and we're not in a quoted field, move on to the next column
        if (cc == ',' && !quote) { ++col; continue; }

        // If it's a newline (CRLF) and we're not in a quoted field, skip the next character
        // and move on to the next row and move to column 0 of that new row
        if (cc == '\r' && nc == '\n' && !quote) { ++row; col = 0; ++c; continue; } if (cc == '\n' && !quote) { ++row; col = 0; continue; }

        // If it's a newline (LF or CR) and we're not in a quoted field,
        // move on to the next row and move to column 0 of that new row
        if (cc == '\n' && !quote) { ++row; col = 0; continue; }
        if (cc == '\r' && !quote) { ++row; col = 0; continue; }

        // Otherwise, append the current character to the current column
        arr[row][col] += cc;
    }
    return arr;
}

function parseCSV()
{
    var file = File.openDialog();   
    return parseCSVWithFile(file);
}

function parseCSVWithPath(path)
{
    var file = new File(path);
    return parseCSVWithFile(file);
}

function parseCSVWithFile(file)
{
    file.open("r");
    var csv = file.read();
    
    return csvStringToArray(csv);
}

// Because apparently they left trim out?!
function trim(str)
{
    return str.replace(/^\s+|\s+$/gm,'');
}


function characterStyleByName(doc, name)
{
    var style = doc.characterStyles.item(name);
    if (style == null || !style.isValid)
        return null;
    return style;
}

function paragraphStyleByName(doc, name)
{
    var style = doc.paragraphStyles.item(name);
    if (style == null || !style.isValid)
        return null;
    return style;
}

function colorByName(doc, name)
{
    var color = doc.colors.item(name);
    if (color == null || !color.isValid)
    {
        return null;
    }
    return color;
}

function makeColor(doc, colorName, colorSpace, colorModel, colorValue) 
{ 
    color = doc.colors.add({name: colorName, space: colorSpace, model: colorModel, colorValue: colorValue}); 
    
    return color; 
} 