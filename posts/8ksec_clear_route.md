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

The user conducted an analysis to identify the functions responsible for proxy detection. Three functions were identified as implementing proxy detection logic, as outlined below:  
  
```
sym.imp.CFNetworkCopySystemProxySettings

sym.ClearRoute.ContentView.isProxyEnabled_...yF_

sym.ClearRoute.ContentView.checkForProxyAndSend_...F_  
```

`CFNetworkCopySystemProxySettings` is a library function used to retrieve device’s system-wide network proxy configuration.

Link: [CFNetworkCopySystemProxySettings Documentation](https://developer.apple.com/documentation/cfnetwork/cfnetworkcopysystemproxysettings())

First, an analysis was conducted to determine where `CFNetworkCopySystemProxySettings` is invoked. Further analysis revealed that this function is called within the `isProxyEnabled` function.

The `isProxyEnabled` is being called in `checkForProxyAndSend`, due to its involvement in proxy detection.

The `checkForProxyAndSend` function performs the following checks:
* If the proxy is **not enabled**, the execution flow jumps to address `0x564c`, which subsequently returns **“Request Successful.”**
* If the proxy is **enabled**, the execution flow does not jump to address `0x564c` and instead returns an error.

Additionally, the `sendSensitiveRequest` function is invoked only when a proxy is not enabled.

Within the `sendSensitiveRequest` function, the following notable details were identified:
* The request is sent to the URL `https://8ksec.io/blog`.
* The transmitted data includes user information and the CTF flag.
* The data is converted into JSON format using `NSJSONSerialization`, utilizing an `NSDictionary`.
* The request is sent using `dataTaskWithRequest:completionHandler:` followed by `resume()`, involving `NSURLRequest` and handling the response via `NSURLResponse`.

Returning to the `isProxyEnabled` function, the logic checks for strings related to `HTTPProxy`.
* When a proxy is detected, execution does **not** jump to address `0x6824`.
* When no proxy is detected, execution jumps to address `0x6824` which marks the successful of the request.

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

For certificate pinning bypass, tools like SSL Kill Switch can be used.

**Links:**
* [SSL Kill Switch 3](https://github.com/NyaMisty/ssl-kill-switch3)
* [MASTG Tool - SSL Kill Switch 2](https://mas.owasp.org/MASTG/tools/ios/MASTG-TOOL-0066/)

## Flag

After bypassing proxy detection and certificate pinning, the intercepted request reveals the flag:

```json
{"user":"john_doe","8ksec_intercepted":"CTF{no_proxies_allowed}"}
```
