
## OriginalGrafanaAlert

# Demonstration 
<img src="doc/webhook.gif" width="1200">


# ViolentMonkey

## For User 
1. Install Violentmonkey

https://chromewebstore.google.com/detail/violentmonkey/jinjaccalgkegednnccohejagnlnfdag?hl=en-US&utm_source=ext_sidebar

2. Download userscripts and install them as initial set up.
   
   A. Click the URL
 - Fastly-addon on zendesk -> https://github.com/fastly/zendesk-userscripts/raw/main/src/fastly-addon.user.js
 - Zendesk-InternalComment-concealer -> https://github.com/fastly/zendesk-userscripts/raw/main/src/zendesk-internal-concealer.user.js
   
   B. Click "Install + Edit"

   
<img src="doc/ViolentMonkey.png" width="1200">

## For Developer 
You can edit scripts on Violentmonkey extention tool. However, whenever I update the script and debug, I have to copy it to Git repo. 
It will be tedious. So I prefer tracking userscripts between Violentmonkey extention and local Git repo. 


1. Clone this repo

2. Open chrome://extensions in Chrome 

3. Choose Violentmonkey

4. Enable "Allow access to file URLs"

5. Open a Userscript on Chrome and VSCode and then click "Track external edits". 

```
open -a "Google Chrome" $HOME/zendesk-userscripts/src/copylink.user.js && code $HOME/zendesk-userscripts/src/copylink.user.js
```

6. Edit the Userscript on VSCode.



FYI : 

Set up userscript repo. 

Settings > Pages > Source > Choose "Branch" > Grab a Domain name like "https://probable-barnacle-z4jp4k8.pages.github.io/" 

(2) 
VSCode tip : 
Useful extention : 
https://marketplace.visualstudio.com/items?itemName=ms-vscode.vscode-typescript-next
