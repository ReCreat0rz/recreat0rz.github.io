---
title: "8ksec - Clear Route"
date: 2025-12-17
excerpt: "Walkthrough for 8ksec - Clear Route iOS challenge involving proxy detection bypass and certificate pinning."
category: [iOS]
tags: [Proxy Detection, Certificate Pinning, 8ksec]
---

# Objectives (ClearRoute)

```
Intercept the outgoing request to retrieve the flag.  Modify, patch, or instrument the app to disable or evade any checks, allowing the request to go through. Intercept the POST data to extract the flag from the constructed key.  
_**  
Intercept smartly**_—this route’s under surveillance. 🛰️
```

# Solution (ClearRoute)

When secure data is sent without using a proxy, the request returns **“Request Successful.”** However, when the same request is sent with a proxy enabled on the iPhone device, the application returns **“Some Error Occurred, Please Try Again,”** which warrants further analysis.

The user conducted an analysis to identify the functions responsible for proxy detection. Three functions were identified as implementing proxy detection logic, as outlined below:  
  
```
sym.imp.CFNetworkCopySystemProxySettings
```

The `checkForProxyAndSend` function performs the following checks:

*(Image or further details skipped due to file format)*
