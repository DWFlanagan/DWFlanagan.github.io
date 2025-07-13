---
title: "Enabling cookie consent on a Jekyll Minimal Mistakes site"
categories:
  - Blog
tags:
  - link
  - jekyll
  - GitHub Copilot
link: https://peateasea.de/enabling-cookie-consent-with-jekyll-minimal-mistakes/
---

Paul's post got me about 80% of the way there, but I was still having issues with

* A persistent banner on iOS (but not on desktop)
* Google Analytics cookie still being set if the user clicked decline

I don't know JavaScript so in the old days I would have been stuck. Instead, I opened up GitHub Copilot in Agent Mode and described the symptoms. It took a couple tries, but it created a test page with buttons for me to test whether cookies were being set correctly, and modified the JavaScript file until it got it right.

I probably could have figured it out given enough time and patience, but frankly I wouldn't have followed through. Now the site has GDPR-compliant terms and Google Analytics.
