### Qlik Sense Chrome Dev Tools Extension

Chrome extension that can be used when developing in Qlik Sense. The extension will add one extra tab in Chrome dev tools (when Ctrl+Shift+i is pressed). The tab can be used to run calculations against the active QS document (the one that is open in the current Chrome tab)

Thanks to Alexander Karlsson ([mindspank](https://github.com/mindspank)) for [qsocks](https://github.com/mindspank/qsocks).

### Why?
In Qlikview when there is need to test some expression usualy textbox object is used. In Sense textbox still can be used but if you have taken all the work space (usually the case) to add one textbox just to test something involves re-sizing at least one object, creating textbox, few clicks to reach the actual expression editor and then check the result. And if you want to create table to check the result the situation is even more complicated. 

Chrome Dev Tools seems the right place for this actions (or Chrome App but this is a different story)

### How to work after install

* open QS Desktop
* open Chrome
* navigate to http://localhost:4848/hub/my/work
* open one document 
* press Ctrl + Shift + i
* navigate to "Qlik Sense Console" tab
* you will see the server, document name (based on the url) and QS Version
* press "Open" to open the document from the console
* Pick Dimension from the drop down (or use the "Empty" one if there is need to simulate textbox behavior)
* enter the expression in the text area
* press "Calculate"

Install the extension from [Chrome Web Store](https://chrome.google.com/webstore/detail/qlik-sense-console/ljeoadpijoacanhinddngndcalkggkmf)

**For Qlik Sense Server Users!!!**

Add "ljeoadpijoacanhinddngndcalkggkmf" (no quites) to "Websocket origin white list" (QMC -> Virtual Proxies -> Default -> check Advanced --> Add new value --> paste --> Apply)

### Future development

* error messages
* multiple dimensions
* view calculations history and option to re-execute them
* sorting the result table
* export the results
* different visualizations?

### Reminder!


![Screenshot](https://raw.githubusercontent.com/countnazgul/qlik-sense-chrome-devtools-extension/master/QlikSenseConsole.png)
