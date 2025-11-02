(function (global) {
  'use strict';

  var dc = {};

  var homeHtml = "snippets/home-snippet.html",
      allCategoriesUrl = "https://coursera-jhu-default-rtdb.firebaseio.com/categories.json",
      categoriesTitleHtml = "snippets/categories-title-snippet.html",
      categoryHtml = "snippets/category-snippet.html",
      menuItemsUrl = "https://coursera-jhu-default-rtdb.firebaseio.com/menu_items/",
      menuItemsTitleHtml = "snippets/menu-items-title-snippet.html",
      menuItemHtml = "snippets/menu-item-snippet.html";

  // Convenience function for inserting innerHTML for 'select'
  var insertHtml = function (selector, html) {
    var targetElem = document.querySelector(selector);
    targetElem.innerHTML = html;
  };

  // Show loading icon inside element identified by 'selector'.
  var showLoading = function (selector) {
    var html = "<div class='text-center'>";
    html += "<img src='css/css/images/m.png'></div>";
    insertHtml(selector, html);
  };

  // Return substitute of '{{propName}}'
  // with propValue in given 'string'
  var insertProperty = function (string, propName, propValue) {
    var propToReplace = "{{" + propName + "}}";
    string = string.replace(new RegExp(propToReplace, "g"), propValue);
    return string;
  };

  // Remove the class 'active' from home and switch to Menu button
  var switchMenuToActive = function () {
    // Remove 'active' from home
    var navHomeButton = document.querySelector("#navHomeButton");
    if (navHomeButton) {
      var classes = navHomeButton.className;
      classes = classes.replace(new RegExp("active", "g"), "");
      navHomeButton.className = classes;
    }

    // Add 'active' to menu button if not already there
    var navMenuButton = document.querySelector("#navMenuButton");
    if (navMenuButton) {
      var classes = navMenuButton.className;
      if (classes.indexOf("active") === -1) {
        classes += " active";
        navMenuButton.className = classes;
      }
    }
  };

  // Given array of category objects, returns a random category object.
  function chooseRandomCategory (categories) {
    // Choose a random index into the array (from 0 inclusively until array length (exclusively))
    var randomArrayIndex = Math.floor(Math.random() * categories.length);
    
    // return category object with that randomArrayIndex
    return categories[randomArrayIndex];
  }

  // Builds HTML for the home page tiles based on the data
  // from the server
  function buildAndShowHomeHTML (categories) {
    
    // Load home snippet page
    $ajaxUtils.sendGetRequest(
      homeHtml,
      function (homeSnippet) {
        
        // TODO: STEP 1 here ▼
        // Choose a random category short_name from the categories array
        var chosenCategoryShortName = chooseRandomCategory(categories).short_name;

        // TODO: STEP 2 here ▼
        // Substitute {{randomCategoryShortName}} in the home-snippet.html
        // with the chosen category short_name
        var homeHtmlToInsertIntoMainPage = insertProperty(homeSnippet, 
                                                           "randomCategoryShortName",
                                                           "'" + chosenCategoryShortName + "'");

        // TODO: STEP 3 here ▼
        // Insert the produced HTML in STEP 2 into the main-content
        // class within container-fluid class
        insertHtml("#main-content", homeHtmlToInsertIntoMainPage);

      },
      false); // False here because we are getting just regular HTML from the server, not JSON.
  }

  // Builds HTML for the categories page based on the data
  // from the server
  function buildAndShowCategoriesHTML (categories) {
    // Load title snippet of categories page
    $ajaxUtils.sendGetRequest(
      categoriesTitleHtml,
      function (categoriesTitleSnippet) {
        // Switch CSS class active to menu button
        switchMenuToActive();

        var categoriesViewHtml =
          buildCategoriesViewHtml(categories,
                                  categoriesTitleSnippet);
        insertHtml("#main-content", categoriesViewHtml);
      },
      false);
  }

  // Using categories data and snippets we already received,
  // build categories view HTML to be inserted into page
  function buildCategoriesViewHtml(categories,
                                   categoriesTitleSnippet) {

    var finalHtml = categoriesTitleSnippet;
    finalHtml += "<section class='row'>";

    // Loop over categories
    for (var i = 0; i < categories.length; i++) {
      // Insert category values
      var html = categoryHtml;
      var name = "" + categories[i].name;
      var short_name = categories[i].short_name;
      html = insertProperty(html, "name", name);
      html = insertProperty(html, "short_name", short_name);
      finalHtml += html;
    }

    finalHtml += "</section>";
    return finalHtml;
  }

  // Builds HTML for the single category page based on the data
  // from the server
  function buildAndShowMenuItemsHTML (categoryMenuItems) {
    // Switch CSS class active to menu button
    switchMenuToActive();

    // Build title from category data
    var title = categoryMenuItems.category.name + " Menu";
    var subtitle = categoryMenuItems.category.special_instructions || "";
    
    var menuItemsTitleSnippet = "<h2 id=\"menu-categories-title\" class=\"text-center\">" + title + "</h2>";
    if (subtitle) {
      menuItemsTitleSnippet += "<div class=\"text-center\">" + subtitle + "</div>";
    }

    var menuItemsViewHtml =
      buildMenuItemsViewHtml(categoryMenuItems,
                              menuItemsTitleSnippet);
    insertHtml("#main-content", menuItemsViewHtml);
  }

  // Using categoryMenuItems data and snippets we already received,
  // build menu items view HTML to be inserted into page
  function buildMenuItemsViewHtml(categoryMenuItems,
                                   menuItemsTitleSnippet) {

    var finalHtml = "<div id=\"main-container\" class=\"container\">";
    finalHtml += menuItemsTitleSnippet;
    finalHtml += "<section class='row'>";

    // Loop over menu items
    for (var i = 0; i < categoryMenuItems.menu_items.length; i++) {
      // Insert menu item values
      var html = menuItemHtml;
      var name = "" + categoryMenuItems.menu_items[i].name;
      var description = "" + categoryMenuItems.menu_items[i].description;
      var price = categoryMenuItems.menu_items[i].price_small;
      var priceString = "";
      if (price) {
        priceString = "$" + price.toFixed(2);
        if (categoryMenuItems.menu_items[i].small_portion_name) {
          priceString += " <small>" + categoryMenuItems.menu_items[i].small_portion_name + "</small>";
        }
      }
      var price_large = categoryMenuItems.menu_items[i].price_large;
      if (price_large) {
        if (priceString) {
          priceString += " / ";
        }
        priceString += "$" + price_large.toFixed(2);
        if (categoryMenuItems.menu_items[i].large_portion_name) {
          priceString += " <small>" + categoryMenuItems.menu_items[i].large_portion_name + "</small>";
        }
      }
      if (!priceString) {
        priceString = "";
      }

      html = insertProperty(html, "name", name);
      html = insertProperty(html, "description", description);
      html = insertProperty(html, "price", priceString);
      html = insertProperty(html, "short_name", categoryMenuItems.menu_items[i].short_name);
      finalHtml += html;
      
      // Add clearfix after every 3rd item for desktop
      if ((i + 1) % 3 === 0) {
        finalHtml += "<div class=\"clearfix visible-md-block visible-lg-block\"></div>";
      }
    }

    finalHtml += "</section>";
    finalHtml += "</div>";
    return finalHtml;
  }

  // Load the menu categories view
  dc.loadMenuCategories = function () {
    showLoading("#main-content");
    $ajaxUtils.sendGetRequest(allCategoriesUrl, buildAndShowCategoriesHTML);
  };

  // Load the menu items view
  // 'categoryShort' is a short_name for a category: 'L', 'D', 'S', etc.
  dc.loadMenuItems = function (categoryShort) {
    showLoading("#main-content");
    $ajaxUtils.sendGetRequest(
      menuItemsUrl + categoryShort + ".json",
      buildAndShowMenuItemsHTML);
  };

  // Expose dc to the global object
  global.$dc = dc;

  // On page load (before images or CSS)
  document.addEventListener("DOMContentLoaded", function (event) {

    // TODO: STEP 0: Look over the code from
    // *** start ***
    // to
    // *** finish ***
    // below.
    // We changed this code to use the $dc namespace to assign all functions and properties
    // instead of declaring them at the global level. We also modified the home tile
    // to have a placeholder "{{randomCategoryShortName}}" in its onclick attribute.
    // You'll need to replace this placeholder with a randomly chosen category short_name.

    // *** start ***

    // TODO: STEP 1: Substitute {{randomCategoryShortName}} with a random category
    // short_name. We're going to:
    // 1. Retrieve all categories from the server
    // 2. Choose a random category
    // 3. Use the short_name of that category to replace {{randomCategoryShortName}} 
    //    in the home-snippet.html file

    // On first load, show home view
    showLoading("#main-content");
    $ajaxUtils.sendGetRequest(
      allCategoriesUrl,
      function (categories) {
        buildAndShowHomeHTML(categories);
      },
      true); // Explicitly set isJsonRequest=true since we are getting JSON from the server

    // TODO: STEP 2: Load the menu categories view
    // This is done by calling: $dc.loadMenuCategories();
    // But we don't need to call it on page load, only when user clicks Menu link

    // TODO: STEP 3: Load the menu items view
    // This is done by calling: $dc.loadMenuItems('SP');
    // But we do this when user clicks on a category or the Specials tile

    // TODO: STEP 4: Assign randomCategoryShortName to a property of $dc:
    // This is done in buildAndShowHomeHTML function above where we choose a random category

    // *** finish ***

  });

})(window);
