![Steam.JS icon](http://umurgedik.com/steamjs/Logo.png)

[demo](4m.umurgedik.com) (dynamic website example. backend built on php)

**Steam.JS** is a client side javascript framework which makes easy to build one page ajax ***websites*** (not suitable for applications).

>Steam.JS is in early **alpha version** and highly depented to **jQuery** and **Underscore.js** libraries. Lot of necessary features are missing. But ready to use in production with some extra work.  

Feel free to ask for help. Please email to <umurgdk@gmail.com>

  
### Features:

1. **Page Manager**:  
Manages pages for your different layouts, different content types or different behaviors. A container for **Steam.Page** objects. It fetches data automatically and passing this data to your defined page object.

2. **Page**:  
You can extend base page object for your specific page logic. You can define your **animations** or fetch **extra data** from server.

3. **Pager**:  
Pager gives you basic pagination logic. Just give the url and it handles all logic for you. It has methods like ***hasNextPage***, ***goToPage***, ***nextPage***

4. **Abstract Menu Widget**:  
Steam.JS provides flexible menu widget which binds **click events** on **configurable dom selectors**. Menu widget also works together with **Steam.PageManger** for simple routing.