---
title: "8ksec - Clear Route"
date: 2025-12-17
excerpt: "Walkthrough for 8ksec - Clear Route iOS challenge involving proxy detection bypass and certificate pinning."
category: [iOS]
tags: [Proxy Detection, Certificate Pinning, 8ksec, Frida, SSL Kill Switch 3]
---


## Objectives (ClearRoute)
```
Intercept the outgoing request to retrieve the flag.  Modify, patch, or instrument the app to disable or evade any checks, allowing the request to go through. Intercept the POST data to extract the flag from the constructed key.  
 
Intercept smartly**_—this route’s under surveillance. 🛰️
```
## Solution (ClearRoute)

When secure data is sent without using a proxy, the request returns **“Request Successful.”** However, when the same request is sent with a proxy enabled on the iPhone device, the application returns **“Some Error Occurred, Please Try Again,”** which warrants further analysis.

![if Proxy is Enabled 1](/assets/img/posts/8ksec_clear_route/if%20Proxy%20is%20Enabled%201.png)


The user conducted an analysis to identify the functions responsible for proxy detection. Three functions were identified as implementing proxy detection logic, as outlined below:  
  
```

sym.imp.CFNetworkCopySystemProxySettings

sym.ClearRoute.ContentView.isProxyEnabled_...yF_

sym.ClearRoute.ContentView.checkForProxyAndSend_...F_  
```

![Search Proxy](/assets/img/posts/8ksec_clear_route/Search%20Proxy.png)

`CFNetworkCopySystemProxySettings` is a library function used to retrieve device’s system-wide network proxy configuration.

Link:
https://developer.apple.com/documentation/cfnetwork/cfnetworkcopysystemproxysettings()

![imported library used for proxy](/assets/img/posts/8ksec_clear_route/imported%20library%20used%20for%20proxy.png)

First, an analysis was conducted to determine where `CFNetworkCopySystemProxySettings` is invoked. Further analysis revealed that this function is called within the `isProxyEnabled` function.

![Proxy Settings is being called into isProxyEnabled](/assets/img/posts/8ksec_clear_route/Proxy%20Settings%20is%20being%20called%20into%20isProxyEnabled.png)

The `**isProxyEnabled**` is being called in `**checkForProxyAndSend**`, due to its involvement in proxy detection.

![isProxyEnabled is being called in checkProxyAndSend](/assets/img/posts/8ksec_clear_route/isProxyEnabled%20is%20being%20called%20in%20checkProxyAndSend.png)

The `checkForProxyAndSend` function performs the following checks:

* If the proxy is **not enabled**, the execution flow jumps to address `0x564c`, which subsequently returns **“Request Successful.”**
* If the proxy is **enabled**, the execution flow does not jump to address `0x564c` and instead returns an error.

![Check Proxy Enabled or Not (checkProxyAndSend)](/assets/img/posts/8ksec_clear_route/Check%20Proxy%20Enabled%20or%20Not%20(checkProxyAndSend).png)

![if Proxy is not Enabled (checkProxyAndSend)](/assets/img/posts/8ksec_clear_route/if%20Proxy%20is%20not%20Enabled%20(checkProxyAndSend).png)

Additionally, the `sendSensitiveRequest` function is invoked only when a proxy is not enabled.

![if Proxy is Disabled , sendSensitiveFunction is called (checkProxyAndSend)](/assets/img/posts/8ksec_clear_route/if%20Proxy%20is%20Disabled%20,%20sendSensitiveFunction%20is%20called%20(checkProxyAndSend).png)

Within the `sendSensitiveRequest` function, the following notable details were identified:

* The request is sent to the URL `https://8ksec.io/blog`.
* The transmitted data includes user information and the CTF flag.
* The data is converted into JSON format using `NSJSONSerialization`, utilizing an `NSDictionary`.
* The request is sent using `dataTaskWithRequest:completionHandler:` followed by `resume()`, involving `NSURLRequest` and handling the response via `NSURLResponse`.

![Target URL](/assets/img/posts/8ksec_clear_route/Target%20URL.png)


![Data](/assets/img/posts/8ksec_clear_route/Data.png)

![NSJSONDeserialization & Dictionary](/assets/img/posts/8ksec_clear_route/NSJSONDeserialization%20&%20Dictionary.png)

![Send the request](/assets/img/posts/8ksec_clear_route/Send%20the%20request.png)

Returning to the `isProxyEnabled` function, the logic checks for strings related to `HTTPProxy`.

* When a proxy is detected, execution does **not** jump to address `0x6824`.
* When no proxy is detected, execution jumps to address `0x6824` which marks the successful of the request.

![Check Proxy Settings (isProxyEnabled)](/assets/img/posts/8ksec_clear_route/Check%20Proxy%20Settings%20(isProxyEnabled).png)

![check if proxy is enabled (isProxyEnabled)](/assets/img/posts/8ksec_clear_route/check%20if%20proxy%20is%20enabled%20(isProxyEnabled).png)

![Search string called HTTPProxy (isProxyEnabled)](/assets/img/posts/8ksec_clear_route/Search%20string%20called%20HTTPProxy%20(isProxyEnabled).png)

![if Proxy Detection Returns False (isProxyEnabled)](/assets/img/posts/8ksec_clear_route/if%20Proxy%20Detection%20Returns%20False%20(isProxyEnabled).png)

In this scenario, the user opted to bypass the proxy detection mechanism by forcing the function to return `0` (false), effectively disabling proxy detection. This was achieved using Frida. The following Frida script demonstrates how the proxy detection logic can be bypassed.

```

console.log("[*] Starting Proxy Detection Bypass")

// Step 1: Find the Function Address

var isProxyEnabled = Module.findBaseAddress("ClearRoute.debug.dylib").add(0x6544);

// Step 2 : Hooking Proxy Detection

Interceptor.attach(isProxyEnabled, {

    onEnter: function(args){

        console.log("\n[*] isProxyEnabled is Called!")

    },

    onLeave: function(retval){

        var proxy = retval.toInt32();

            if (proxy == 1){

                console.log("\n[-] PROXY is DETECTED")

                retval.replace(0);

                console.log("\n[+] SUCESSFULLY MODIFIED PROXY VALUE TO RETURN FALSE")

            } else {

                console.log ("\n[*] PROXY DIDN'T ENABLED IN IPHONE DEVICE")

            }

        }

    });

```

As a result, the proxy detection mechanism was successfully bypassed. However, requests to `8ksec.io` could not be intercepted because the application uses HTTPS with certificate pinning, as indicated by the TLS handshake failure.

![Certificate Pinning](/assets/img/posts/8ksec_clear_route/Certificate%20Pinning.png)

To bypass certificate pinning, **SSL Kill Switch 3** can be used, as it is capable of disabling most certificate pinning validation checks on iOS applications. This tool is also listed as **MSTG-TOOL-0066** in the _OWASP Mobile Application Security Testing Guide (MASTG)_.

Link:
https://github.com/NyaMisty/ssl-kill-switch3
https://mas.owasp.org/MASTG/tools/ios/MASTG-TOOL-0066/

![SSL Kill Switch 3](/assets/img/posts/8ksec_clear_route/SSL%20Kill%20Switch%203.png)

As a result, after enabling **SSL Kill Switch 3**, the certificate pinning mechanism was successfully bypassed. Combined with the previously bypassed proxy detection checks, the user was able to successfully intercept the request and obtain the flag.

```

{"user":"john_doe","8ksec_intercepted":"CTF{no_proxies_allowed}"}

```

![Bypassing Certificate Pinning](/assets/img/posts/8ksec_clear_route/Bypassing%20Certificate%20Pinning.png)
