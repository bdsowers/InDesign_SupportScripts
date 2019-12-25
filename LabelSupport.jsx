//@include "Utilities/Utilities.jsx"

app.doScript(labelSupport, ScriptLanguage.JAVASCRIPT, undefined, UndoModes.ENTIRE_SCRIPT, "Tag Support");

function labelSupport()
{
	var arr = parseCSV();
	
	var visInfo = visibilityColumnInformation(arr);
	var disableInfoCol = disabledItemsInfo(arr); 

	var doc = app.activeDocument;
	for (var pageIdx = 0; pageIdx < doc.pages.length; ++pageIdx)
	{
		var page = doc.pages[pageIdx];

		if (arr.length > pageIdx + 1)
		{	
			var csvRow = arr[pageIdx + 1];

			// METHOD 1: Use columns starting with v_ to control visibility
			hideUsingVisibilityColumns(csvRow, page, visInfo);

			// METHOD 2: Use disabled_items column to control visibility
			hideUsingDisabledItemsColumn(csvRow, page, disableInfoCol);
		}
	}
}

function hideUsingVisibilityColumns(csvRow, page, visInfo)
{
	for (var visInfoIdx = 0; visInfoIdx < visInfo.length; ++visInfoIdx)
	{
		var cellPosition = visInfo[visInfoIdx][0];
		var label = trim(visInfo[visInfoIdx][1]);
		var isVisible = (trim(csvRow[cellPosition]) == 'TRUE');

		if (!isVisible)
		{
			hideObjectsWithLabel(label, page);
		}
	}	
}

function hideUsingDisabledItemsColumn(csvRow, page, disableInfoCol)
{
	if (disableInfoCol != -1)
	{
		var listStr = csvRow[disableInfoCol];
		var list = listStr.split(',');
		for (var disabledItemIdx = 0; disabledItemIdx < list.length; ++disabledItemIdx)
		{
			var disabledItem = trim(list[disabledItemIdx]);
			if (disabledItem.length > 0)
			{
				hideObjectsWithLabel(disabledItem, page);
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

function disabledItemsInfo(csvArr)
{
	for (var i = 0; i < csvArr[0].length; ++i)
	{
		if (csvArr[0][i] == "disabled_items")
		{
			return i;
		}
	}

	return -1;	
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