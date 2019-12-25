var allErrorHistory = [];

function resetErrorHistory()
{
	allErrorHistory = [];
}

function reportError(message)
{
	if (!errorAlreadyReported(message, allErrorHistory))
	{
		allErrorHistory.push(message);
	}
}

function errorAlreadyReported(message, history)
{
	for (var i = 0; i < history.length; ++i)
	{
		if (history[i] == message)
		{
			return true;
		}
	}

	return false;
}

function displayErrorReport(silent)
{
	if (allErrorHistory == null)
		return;

	// If the history is small enough to show in an error dialog, show that error dialog
	// Otherwise, write a file and point to that file.
	// If there's a silent mode, always write to a file and point to that file.
	if (silent || allErrorHistory.length > 5)
	{
		// TODO
	}
	else if (allErrorHistory.length > 0)
	{
		var alertMessage = 'Errors Found:\n' + allErrorHistory.join('\n');
		alert(alertMessage);
	}
}
