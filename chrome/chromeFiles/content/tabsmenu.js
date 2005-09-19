//
// JavaScript functions for Firefox Tabs Menu extension
// Michael Wardle <michael@endbracket.net>
//

// Switch to a tab
// The event parameter is the click event on the specific menuitem
function selectTab(event)
{
  var index = event.target.getAttribute("data");

  //window.alert("Selecting tab number " + index);
  gBrowser.mTabContainer.selectedIndex = index;
  gBrowser.updateCurrentBrowser();
}

// Create the tab menuitems for the current tabs and add them to the Tabs menu
function createTabsMenu(menuPopup)
{
  var l = gBrowser.mPanelContainer.childNodes.length;
  for(var i = 0; i < l; i++)
  {
    var browser = gBrowser.getBrowserAtIndex(i);
    var menuItem = document.createElement("menuitem");
    var tabNumber = i + 1;
    var accessKey = tabNumber % 10;
    var title = (browser.contentTitle) ? browser.contentTitle : "(Untitled)";

    menuItem.setAttribute("id", "tabsmenu-tab" + i);
    menuItem.setAttribute("data", i);
    menuItem.setAttribute("label", tabNumber + " - " + title);
    menuItem.setAttribute("accesskey", accessKey);

    menuItem.addEventListener("command", selectTab, false);

    //window.alert("Creating Tabs menu item " + tabNumber + " (" + browser.label + ")");
    menuPopup.appendChild(menuItem);
  }
}

// Remove all tab menuitems from the Tabs menu
function destroyTabsMenu(menuPopup)
{
  var node;
  try
  {
    node = menuPopup.lastChild;
  }
  catch(e)
  {
    // Shouldn't get here since this is only called when the list is populated
    window.alert("No last child, is Tabs menu empty?");
    return;
  }

  while (node)
  {
    var next;
    try
    {
      //window.alert("Removing Tabs menu item");
      next = node.previousSibling;
      node.parentNode.removeChild(node);
      node = next;
    }
    catch(e)
    {
      window.alert("Failed to remove Tabs menu item");
      break;
    }
  }
}

// vi: set sw=2 ts=33:
