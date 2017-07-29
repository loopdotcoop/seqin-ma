# MathSeqin

#### The base class for all mathematical Seqins.

It generates sine waves with ADSR envelopes.


Authors
-------
Built by Rich Plastow and Monty Anderson for Loop.Coop.

+ __Homepage:__     [loopdotcoop.github.io/seqin-ma/](https://loopdotcoop.github.io/seqin-ma/)
+ __GitHub:__       [loopdotcoop/seqin-ma](https://github.com/loopdotcoop/seqin-ma)
+ __NPM:__          [seqin-ma](https://www.npmjs.com/package/seqin-ma)
+ __Twitter:__      [@loopdotcoop](https://twitter.com/loopdotcoop)
+ __Location:__     Brighton, UK


App
---
+ __Last update:__  2017/07/28
+ __Version:__      1.0.1


Tested
------
+ __Android 7.1 (Pixel):__  Chrome 58+, Firefox 51+
+ __iOS 10.3 (iPad Pro):__  Safari 10+
+ __Windows 10:__           Edge 14+
+ __Windows 7:__            Chrome 49+, Opera 36+
+ __Windows XP:__           Firefox 45+
+ __OS X Sierra:__          Safari 10.1+


Changelog
---------
+ 0.0.1       Initial commit on master branch; isomorphic mocha/chai working
+ 0.0.2       constructor() and getBuffers() complete; initial support/usage.js
+ 0.0.3       getBuffers() generates silent buffers; removed support/usage.js
+ 0.0.4       Defer most functionality to seqin-si
+ 0.0.5       Move Mocha and Chai from local node_modules to global
+ 0.0.6       Better use of Promises
- 0.0.7       Move buildBuffers() etc from Rich1MathSeqin; fully Promise-based
+ 1.0.0       Upgrade to spec 20170728
+ 1.0.1       Buffer-ID methods `_get...Id()` work better in sub-classes
