//
// JavaScript functions for Firefox Tabs Menu extension
// Michael Wardle <michael@endbracket.net>
//

// Switch to a tab
function selectTab(event)
{
  //window.alert("Selecting item");
  var index = event.target.getAttribute("value");
  var container = gBrowser.mTabContainer;
  if (container)
  {
    container.selectedIndex = index;
  }
  else
  {
    logMessage("Cannot get tab container");
  }
  gBrowser.updateCurrentBrowser();
}

// Create the tab menuitems for the current tabs and add them to the Tabs menu
function createTabsMenu()
{
  // Clear the menu before repopulating it
  destroyTabsMenu();
  //window.alert("Creating menu");
  var menu = document.getElementById("menu_TabsPopup");
  if (!menu)
  {
    return false;
  }

  if (showActions())
  {
    // Add the separator to the empty menu
    var actionSeparator = document.createElement("menuseparator");
    if (actionSeparator)
    {
      menu.appendChild(actionSeparator);
      var newItem = document.createElement("menuitem");
      if (newItem)
      {
        newItem.setAttribute("label", "New Tab");
        newItem.setAttribute("key", "key_newNavigatorTab");
        newItem.setAttribute("command", "cmd_newNavigatorTab");
        newItem.setAttribute("accesskey", "n");
      }
      menu.insertBefore(newItem, actionSeparator);
      var closeItem = document.createElement("menuitem");
      if (closeItem)
      {
        closeItem.setAttribute("label", "Close Tab");
        closeItem.setAttribute("key", "key_close");
        closeItem.setAttribute("command", "cmd_close");
        closeItem.setAttribute("accesskey", "c");
      }
      menu.insertBefore(closeItem, actionSeparator);
    }
  }

  var selected = gBrowser.mPanelContainer.selectedIndex;
  var l = gBrowser.mPanelContainer.childNodes.length;
  for (var i = 0; i < l; i++)
  {
    var browser = gBrowser.getBrowserAtIndex(i);
    var tabNumber = i + 1;
    var title = (browser.contentTitle) ? browser.contentTitle : "(Untitled)";

    var menuItem = document.createElement("menuitem");
    if (menuItem)
    {
      menuItem.setAttribute("id", "tabs-menu-tab" + i);
      menuItem.setAttribute("value", i);

      if (showIcons())
      {
        menuItem.setAttribute("class", "menuitem-iconic");
        menuItem.setAttribute("image", browser.mIconURL);
        menuItem.setAttribute("current", selected == i);
      }
      else
      {
        menuItem.setAttribute("class", "menuitem-radio");
        menuItem.setAttribute("type", "radio");
        menuItem.setAttribute("checked", selected == i);
      }

      if (showShortcuts())
      {
        menuItem.setAttribute("label", tabNumber + " - " + title);

        // Only the first ten items in the list have keyboard shortcuts
        var accessKey = tabNumber % 10;
        if (tabNumber <= 10)
        {
          menuItem.setAttribute("accesskey", accessKey);
          //menuItem.setAttribute("acceltext", "Alt+" + accessKey);
        }
      }
      else
      {
        menuItem.setAttribute("label", title);
      }

      // XXX Why don't any of these work on Mac!?
      // XXX This is currently being handled via the "command"
      //     attribute of the menupopup that contains the menu
      //menuItem.addEventListener("command", selectTab, false);
      //menuItem.setAttribute("oncommand", "selectTab();");
      //menuItem.setAttribute("command", "selectTab();");
      //menuItem.addEventListener("click", selectTab, false);

      menu.appendChild(menuItem);
    }
  }
}

// Remove all tab menuitems from the Tabs menu
function destroyTabsMenu()
{
  //window.alert("Destroying menu");
  var menu = document.getElementById("menu_TabsPopup");
  var length = menu.childNodes.length;
  for (var i = length - 1; i >= 0; i--)
  {
    var tabNumber = i + 1;
    var node = menu.childNodes[i];
    // XXX or maybe node.getAttribute("class") == "menuitem-radio"
    //if (node.getAttribute("value"))
    //{
      try
      {
        menu.removeChild(node);
      }
      catch(e)
      {
        logMessage("Failed to remove menu item " + tabNumber + ": " + label);
      }
    //}
  }
}

// Print the names of all the tabs in the current window
function dumpTabs()
{
  var l = gBrowser.mPanelContainer.childNodes.length;
  for (var i = 0; i < l; i++)
  {
    var browser = gBrowser.getBrowserAtIndex(i);
    var tabNumber = i + 1;
    var title = (browser.contentTitle) ? browser.contentTitle : "(Untitled)";
    logMessage(tabNumber + ": " + title);
  }
}

// Send a message to the system log
function logMessage(message)
{
  try
  {
    log = Components.classes["@mozilla.org/consoleservice;1"]
                    .getService(Components.interfaces.nsIConsoleService);
    log.logStringMessage(message);
  }
  catch(e)
  {
    Components.reportError(e);
  }
}

// Check whether the user wants actions such as New Tab and
// Close Tab to appear in the drop-down list.
function showActions()
{
  try
  {
    prefs = Components.classes["@mozilla.org/preferences-service;1"]
                      .getService(Components.interfaces.nsIPrefService)
                      .getBranch("extensions.tabsmenu.");
    return prefs.getBoolPref("showactions");
  } 
  catch(e)
  {
    Components.reportError(e);
    return false;
  }
}

// Check whether the user wants to see each page's icon next to
// the title in the menu.  If not, we show a radio button.
function showIcons()
{
  try
  {
    prefs = Components.classes["@mozilla.org/preferences-service;1"]
                      .getService(Components.interfaces.nsIPrefService)
                      .getBranch("extensions.tabsmenu.");
    return prefs.getBoolPref("showicons");
  } 
  catch(e)
  {
    Components.reportError(e);
    return false;
  }
}

// Check whether the user wants the tab's title to be prefixed
// with a number indicating the keyboard shortcut to select that
// tab.
function showShortcuts()
{
  try
  {
    prefs = Components.classes["@mozilla.org/preferences-service;1"]
                      .getService(Components.interfaces.nsIPrefService)
                      .getBranch("extensions.tabsmenu.");
    return prefs.getBoolPref("showshortcuts");
  } 
  catch(e)
  {
    Components.reportError(e);
    return false;
  }
}

// vi: set sw=2 ts=33:
