---
title: "8ksec - Clear Route"
date: 2025-12-17
excerpt: "Walkthrough for 8ksec - Clear Route iOS challenge involving proxy detection bypass and certificate pinning."
category: [iOS]
tags: [Proxy Detection, Certificate Pinning, 8ksec, Frida, SSL Kill Switch 2]
---

# Objectives (ClearRoute)

```
Intercept the outgoing request to retrieve the flag.  Modify, patch, or instrument the app to disable or evade any checks, allowing the request to go through. Intercept the POST data to extract the flag from the constructed key.  
_**  
Intercept smartly**_—this route’s under surveillance. 🛰️
```

# Solution (ClearRoute)

When secure data is sent without using a proxy, the request returns **“Request Successful.”** However, when the same request is sent with a proxy enabled on the iPhone device, the application returns **“Some Error Occurred, Please Try Again,”** which warrants further analysis.

![Proxy Enabled Error](/assets/img/posts/8ksec_clear_route/if%20Proxy%20is%20Enabled%201.png)

The user conducted an analysis to identify the functions responsible for proxy detection. Three functions were identified as implementing proxy detection logic, as outlined below:  
  
```
sym.imp.CFNetworkCopySystemProxySettings

sym.ClearRoute.ContentView.isProxyEnabled_...yF_

sym.ClearRoute.ContentView.checkForProxyAndSend_...F_  
```

![Search Proxy](/assets/img/posts/8ksec_clear_route/Search%20Proxy.png)

`CFNetworkCopySystemProxySettings` is a library function used to retrieve device’s system-wide network proxy configuration.

Link: [CFNetworkCopySystemProxySettings Documentation](https://developer.apple.com/documentation/cfnetwork/cfnetworkcopysystemproxysettings())

![Imported Library](/assets/img/posts/8ksec_clear_route/imported%20library%20used%20for%20proxy.png)

First, an analysis was conducted to determine where `CFNetworkCopySystemProxySettings` is invoked. Further analysis revealed that this function is called within the `isProxyEnabled` function.

![Proxy Settings Call](/assets/img/posts/8ksec_clear_route/Proxy%20Settings%20is%20being%20called%20into%20isProxyEnabled.png)

The `isProxyEnabled` is being called in `checkForProxyAndSend`, due to its involvement in proxy detection.

![isProxyEnabled Call](/assets/img/posts/8ksec_clear_route/isProxyEnabled%20is%20being%20called%20in%20checkProxyAndSend.png)

The `checkForProxyAndSend` function performs the following checks:
* If the proxy is **not enabled**, the execution flow jumps to address `0x564c`, which subsequently returns **“Request Successful.”**
* If the proxy is **enabled**, the execution flow does not jump to address `0x564c` and instead returns an error.

![Check Proxy Enabled](/assets/img/posts/8ksec_clear_route/Check%20Proxy%20Enabled%20or%20Not%20(checkProxyAndSend).png)

![Proxy Not Enabled Logic](/assets/img/posts/8ksec_clear_route/if%20Proxy%20is%20not%20Enabled%20(checkProxyAndSend).png)

Additionally, the `sendSensitiveRequest` function is invoked only when a proxy is not enabled.

![Send Sensitive Request](/assets/img/posts/8ksec_clear_route/if%20Proxy%20is%20Disabled%20,%20sendSensitiveFunction%20is%20called%20(checkProxyAndSend).png)

Within the `sendSensitiveRequest` function, the following notable details were identified:
* The request is sent to the URL `https://8ksec.io/blog`.
* The transmitted data includes user information and the CTF flag.
* The data is converted into JSON format using `NSJSONSerialization`, utilizing an `NSDictionary`.
* The request is sent using `dataTaskWithRequest:completionHandler:` followed by `resume()`, involving `NSURLRequest` and handling the response via `NSURLResponse`.

![Target URL](/assets/img/posts/8ksec_clear_route/Target%20URL.png)

![Data](/assets/img/posts/8ksec_clear_route/Data.png)

![NSJSONSerialization](/assets/img/posts/8ksec_clear_route/NSJSONDeserialization%20&%20Dictionary.png)

![Send Request](/assets/img/posts/8ksec_clear_route/Send%20the%20request.png)

Returning to the `isProxyEnabled` function, the logic checks for strings related to `HTTPProxy`.
* When a proxy is detected, execution does **not** jump to address `0x6824`.
* When no proxy is detected, execution jumps to address `0x6824` which marks the successful of the request.

![Check Proxy Settings](/assets/img/posts/8ksec_clear_route/Check%20Proxy%20Settings%20(isProxyEnabled).png)

![Check Proxy Enabled Logic](/assets/img/posts/8ksec_clear_route/check%20if%20proxy%20is%20enabled%20(isProxyEnabled).png)

![Search HTTPProxy String](/assets/img/posts/8ksec_clear_route/Search%20string%20called%20HTTPProxy%20(isProxyEnabled).png)

![Proxy Detection Returns False](/assets/img/posts/8ksec_clear_route/if%20Proxy%20Detection%20Returns%20False%20(isProxyEnabled).png)

## Bypass Script

```javascript
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

## Certificate Pinning

![Certificate Pinning](/assets/img/posts/8ksec_clear_route/Certificate%20Pinning.png)

For certificate pinning bypass, tools like SSL Kill Switch can be used.

**Links:**
* [SSL Kill Switch 3](https://github.com/NyaMisty/ssl-kill-switch3)
* [MASTG Tool - SSL Kill Switch 2](https://mas.owasp.org/MASTG/tools/ios/MASTG-TOOL-0066/)

![SSL Kill Switch 2](/assets/img/posts/8ksec_clear_route/SSL%20Kill%20Switch%203.png)

## Flag

After bypassing proxy detection and certificate pinning, the intercepted request reveals the flag:

```json
{"user":"john_doe","8ksec_intercepted":"CTF{no_proxies_allowed}"}
```

![Bypassing Certificate Pinning](/assets/img/posts/8ksec_clear_route/Bypassing%20Certificate%20Pinning.png)
