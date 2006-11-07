//
// JavaScript functions for Firefox Tabs Menu extension
// Michael Wardle <michael@endbracket.net>
//

// Switch to a tab
function selectTab(event)
{
  //window.alert("Selecting item");
  var index = event.target.getAttribute("value");
  if (gBrowser)
  {
    var container = gBrowser.mTabContainer;
    if (container)
    {
      container.selectedIndex = index;
    }
    else
    {
      logMessage("Cannot get tab container");
    }
  }
  else
  {
    logMessage("Cannot get global browser");
  }
}

// Create the tab menuitems for the current tabs and add them to the Tabs menu
function createTabsMenu()
{
  // Clear the menu before repopulating it
  destroyTabsMenu();

  // Get strings for the user's locale
  //window.alert("Getting strings");
  var tbstringbundle;
  if (gBrowser)
  {
    try
    {
      tbstringbundle = gBrowser.mStringBundle;
    }
    catch (e)
    {
      logMessage("Cannot get strings");
    }
  }

  //window.alert("Creating menu");
  var menu = document.getElementById("menu_TabsPopup");
  if (menu)
  {
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
          menu.insertBefore(newItem, actionSeparator);
        }
        else
        {
          logMessage("Cannot create New Tab item");
        }
        var closeItem = document.createElement("menuitem");
        if (closeItem)
        {
          closeItem.setAttribute("label", "Close Tab");
          closeItem.setAttribute("key", "key_close");
          closeItem.setAttribute("command", "cmd_close");
          closeItem.setAttribute("accesskey", "c");
          menu.insertBefore(closeItem, actionSeparator);
        }
        else
        {
          logMessage("Cannot create Close Tab item");
        }
      }
      else
      {
        logMessage("Cannot get menu separator");
      }
    }

    if (gBrowser)
    {
      if (gBrowser.mPanelContainer)
      {
        var selected = gBrowser.mPanelContainer.selectedIndex;
        var l = gBrowser.mPanelContainer.childNodes.length;
        for (var i = 0; i < l; i++)
        {
          var browser = gBrowser.getBrowserAtIndex(i);
          if (browser)
          {
            var tabNumber = i + 1;
            var defaultTitle;
            if (tbstringbundle)
            {
              defaultTitle = tbstringbundle.getString("tabs.untitled");
            }
            defaultTitle = (defaultTitle) ? defaultTitle : "(Untitled)";

            var title = (browser.contentTitle) ? browser.contentTitle : defaultTitle;

            var menuItem = document.createElement("menuitem");
            if (menuItem)
            {
              menuItem.setAttribute("id", "tabs-menu-tab" + i);
              menuItem.setAttribute("value", i);

              if (useIcons())
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
            else
            {
              logMessage("Cannot create menu item");
            }
          }
          else
          {
            logMessage("Cannot get current browser");
          }
        }
      }
      else
      {
        logMessage("Cannot get panel container");
      }
    }
    else
    {
      logMessage("Cannot get global browser");
    }
  }
  else
  {
    logMessage("Cannot get menu root");
  }
}

// Remove all tab menuitems from the Tabs menu
function destroyTabsMenu()
{
  //window.alert("Destroying menu");
  var menu = document.getElementById("menu_TabsPopup");
  if (menu)
  {
    var length = menu.childNodes.length;
    for (var i = length - 1; i >= 0; i--)
    {
      var tabNumber = i + 1;
      var node = menu.childNodes[i];
      try
      {
        menu.removeChild(node);
      }
      catch(e)
      {
        logMessage("Failed to remove menu item " + tabNumber + ": " + label);
      }
    }
  }
  else
  {
    logMessage("Cannot get menu root");
  }
}

// Print the names of all the tabs in the current window
function dumpTabs()
{
  if (gBrowser)
  {
    if (gBrowser.mPanelContainer)
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
    else
    {
      logMessage("Cannot get panel container");
    }
  }
  else
  {
    logMessage("Cannot get global browser");
  }
}

// Send a message to the system log
function logMessage(message)
{
  try
  {
    var log = Components.classes["@mozilla.org/consoleservice;1"]
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
    var prefs = Components.classes["@mozilla.org/preferences-service;1"]
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
function useIcons()
{
  try
  {
    var prefs = Components.classes["@mozilla.org/preferences-service;1"]
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
    var prefs = Components.classes["@mozilla.org/preferences-service;1"]
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
