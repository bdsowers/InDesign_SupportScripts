//@include "Utilities.jsx"

app.doScript(tagSupport, ScriptLanguage.JAVASCRIPT, undefined, UndoModes.ENTIRE_SCRIPT, "Tag Support");

function tagSupport()
{
	var arr = parseCSV();
	
	visInfo = visibilityColumnInformation(arr);

	var doc = app.activeDocument;
	for (var pageIdx = 0; pageIdx < doc.pages.length; ++pageIdx)
	{
		var page = doc.pages[pageIdx];

		if (arr.length > pageIdx + 1)
		{
			var csvRow = arr[pageIdx + 1];

			for (var visInfoIdx = 0; visInfoIdx < visInfo.length; ++visInfoIdx)
			{
				var cellPosition = visInfo[visInfoIdx][0];
				var label = visInfo[visInfoIdx][1];
				var isVisible = (csvRow[cellPosition] == 'TRUE');

				if (!isVisible)
				{
					hideObjectsWithLabel(label, page);
				}
			}
		}
	}
}

function visibilityColumnInformation(csvArr)
{
	positions = [];

	for (var i = 0; i < csvArr[0].length; ++i)
	{
		if (csvArr[0][i].indexOf("v_") == 0)
		{
			positions.push([i, csvArr[0][i].replace("v_", "")]);
		}
	}

	return positions;
}

function parseCSV()
{
	var file = File.openDialog();	
	file.open("r");
	var csv = file.read();

	return csvStringToArray(csv);
}

function hideObjectsWithLabel(label, page)
{
	var objects = [];

	for (var i = 0; i < page.allPageItems.length; ++i)
	{
		var item = page.allPageItems[i];

		if (item != null && item.label == label)
		{
			item.remove();

			objects.push(item);
		}
	}

	return objects;
}