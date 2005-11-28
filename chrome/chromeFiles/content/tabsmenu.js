//
// JavaScript functions for Firefox Tabs Menu extension
// Michael Wardle <michael@endbracket.net>
//

// Switch to a tab
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
  var menu = menuPopup;
  var selected = gBrowser.mPanelContainer.selectedIndex;

  var l = gBrowser.mPanelContainer.childNodes.length;
  for(var i = 0; i < l; i++)
  {
    var browser = gBrowser.getBrowserAtIndex(i);
    var tabNumber = i + 1;
    var title = (browser.contentTitle) ? browser.contentTitle : "(Untitled)";

    var menuItem = document.createElement("menuitem");
    menuItem.setAttribute("id", "tabs-menu-tab" + i);
    menuItem.setAttribute("name", "tabs-menu-tabs");
    menuItem.setAttribute("data", i);
    menuItem.setAttribute("checked", selected == i);
    menuItem.setAttribute("selected", selected == i);

    if (useIcons())
    {
      menuItem.setAttribute("class", "menuitem-iconic");
      menuItem.setAttribute("image", browser.mIconURL);
    }
    else
    {
      menuItem.setAttribute("class", "menuitem-radio");
      menuItem.setAttribute("type", "radio");
    }

    menuItem.setAttribute("label", tabNumber + " - " + title);

    // Only the first ten items in the list have keyboard shortcuts
    var accessKey = tabNumber % 10;
    if (tabNumber <= 10)
    {
      menuItem.setAttribute("accesskey", accessKey);
      //menuItem.setAttribute("acceltext", "Alt+" + accessKey);
    }

    menuItem.addEventListener("command", selectTab, false);

    //window.alert("Creating Tabs menu item " + tabNumber + " (" + browser.label + ")");
    menu.appendChild(menuItem);
  }
}

// Remove all tab menuitems from the Tabs menu
function destroyTabsMenu(menuPopup)
{
  var menu = menuPopup;
  //var menu = getElementById("tabs-menu-list");
  var node;
  try
  {
    node = menu.lastChild;
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

// Check whether tab icons should be used
function useIcons()
{
  try
  {
    prefs = Components.classes["@mozilla.org/preferences-service;1"]
                      .getService(Components.interfaces.nsIPrefService)
                      .getBranch("extensions.tabsmenu.");
    return prefs.getBoolPref("useicons");
  } 
  catch (ex)
  {
    Components.reportError(ex);
    return false;
  }
}

// vi: set sw=2 ts=33:
