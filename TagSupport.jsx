app.doScript(tagSupport, ScriptLanguage.JAVASCRIPT, undefined, UndoModes.ENTIRE_SCRIPT, "Tag Support");

function tagSupport()
{
	hideObjectsWithLabel("reward_attack");
}


function hideObjectsWithLabel(label)
{
	var doc = app.properties.activeDocument;
	var currentPage = doc.pages[0];

	var objects = findObjectsWithLabel(label, currentPage);
}

function findObjectsWithLabel(label, page)
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