//
// JavaScript functions for Firefox Tabs Menu extension
// Mikel Ward <mikel@mikelward.com>
//

// Fake namespace
var tabsmenu = {

// Switch to a tab
selectTab: function(event)
{
  //window.alert("Selecting item");
  var target = event.target;
  if (target)
  {
    var index = target.getAttribute("value");
    if (index)
    {
      if (gBrowser)
      {
        var container = gBrowser.mTabContainer;
        if (container)
        {
          container.selectedIndex = index;
        }
        else
        {
          tabsmenu.logMessage("Cannot get tab container");
        }
      }
      else
      {
        tabsmenu.logMessage("Cannot get global browser");
      }
    }
    else
    {
      tabsmenu.logMessage("Cannot get tab index");
    }
  }
  else
  {
    tabsmenu.logMessage("Cannot get event target");
  }
},

// Create the tab menuitems for the current tabs and add them to the Tabs menu
createTabsMenu: function()
{
  // Clear the menu before repopulating it
  tabsmenu.destroyTabsMenu();

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
      tabsmenu.logMessage("Cannot get strings");
    }
  }

  //window.alert("Creating menu");
  var menu = document.getElementById("menu_TabsPopup");
  if (menu)
  {
    if (tabsmenu.showActions())
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
          tabsmenu.logMessage("Cannot create New Tab item");
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
          tabsmenu.logMessage("Cannot create Close Tab item");
        }
      }
      else
      {
        tabsmenu.logMessage("Cannot get menu separator");
      }
    }

    if (gBrowser)
    {
      if (gBrowser.mTabContainer)
      {
        var tabs = gBrowser.mTabContainer.childNodes;
        var l = tabs.length;
        for (var i = 0; i < tabs.length; i++)
        {
          var tab = tabs[i];
          if (tab)
          {
            var tabNumber = i + 1;
            var title = tab.getAttribute("label");

            var menuItem = document.createElement("menuitem");
            if (menuItem)
            {
              menuItem.setAttribute("id", "tabs-menu-tab" + i);
              menuItem.setAttribute("value", i);

              if (tabsmenu.showIcons())
              {
                menuItem.setAttribute("class", "menuitem-iconic");
                menuItem.setAttribute("image", tab.getAttribute("image"));
                menuItem.setAttribute("current", tab.getAttribute("selected"));
              }
              else
              {
                menuItem.setAttribute("class", "menuitem-radio");
                menuItem.setAttribute("type", "radio");
                menuItem.setAttribute("checked", tab.getAttribute("selected"));
              }

              if (tabsmenu.showShortcuts())
              {
                menuItem.setAttribute("label", tabNumber + " - " + title);

                // Only the first ten items in the list have keyboard shortcuts
                var accessKey = tabNumber % 10;
                if (tabNumber <= 10)
                {
                  menuItem.setAttribute("accesskey", accessKey);
                }
              }
              else
              {
                menuItem.setAttribute("label", title);
              }

              menuItem.addEventListener("command", tabsmenu.selectTab, false);

              menu.appendChild(menuItem);
            }
            else
            {
              tabsmenu.logMessage("Cannot create menu item");
            }
          }
          else
          {
            tabsmenu.logMessage("Cannot get current browser");
          }
        }
      }
      else
      {
        tabsmenu.logMessage("Cannot get panel container");
      }
    }
    else
    {
      tabsmenu.logMessage("Cannot get global browser");
    }
  }
  else
  {
    tabsmenu.logMessage("Cannot get menu root");
  }
},

// Remove all tab menuitems from the Tabs menu
destroyTabsMenu: function()
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
        tabsmenu.logMessage("Failed to remove menu item " + tabNumber + ": " + label);
      }
    }
  }
  else
  {
    tabsmenu.logMessage("Cannot get menu root");
  }
},

// Print the names of all the tabs in the current window
dumpTabs: function()
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
        tabsmenu.logMessage(tabNumber + ": " + title);
      }
    }
    else
    {
      tabsmenu.logMessage("Cannot get panel container");
    }
  }
  else
  {
    tabsmenu.logMessage("Cannot get global browser");
  }
},

// Send a message to the system log
logMessage: function(message)
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
},

// Check whether the user wants actions such as New Tab and
// Close Tab to appear in the drop-down list.
showActions: function()
{
  try
  {
    var prefs = Components.classes["@mozilla.org/preferences-service;1"]
                          .getService(Components.interfaces.nsIPrefService)
                          .getBranch("extensions.tabsmenu.");
    return prefs.getBoolPref("showactions");
  } 
  catch (e)
  {
    Components.reportError(e);
    return false;
  }
},

// Check whether the user wants to see each page's icon next to
// the title in the menu.  If not, we show a radio button.
showIcons: function()
{
  try
  {
    var prefs = Components.classes["@mozilla.org/preferences-service;1"]
                          .getService(Components.interfaces.nsIPrefService)
                          .getBranch("extensions.tabsmenu.");
    return prefs.getBoolPref("showicons");
  } 
  catch (e)
  {
    Components.reportError(e);
    return false;
  }
},

// Check whether the user wants the tab's title to be prefixed
// with a number indicating the keyboard shortcut to select that
// tab.
showShortcuts: function()
{
  try
  {
    var prefs = Components.classes["@mozilla.org/preferences-service;1"]
                          .getService(Components.interfaces.nsIPrefService)
                          .getBranch("extensions.tabsmenu.");
    return prefs.getBoolPref("showshortcuts");
  } 
  catch (e)
  {
    Components.reportError(e);
    return false;
  }
}

}

// vi: set sw=2 ts=33:
