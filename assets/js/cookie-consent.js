// Simple custom cookie consent for iOS compatibility
(function () {
    'use strict';

    // Simple cookie functions (defined early)
    function getCookie(name) {
        var nameEQ = name + '=';
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    // Early GA blocking - prevent any GA from loading until consent is given
    var originalGtag = window.gtag;
    var originalDataLayer = window.dataLayer;

    // Block gtag immediately
    window.gtag = function () {
        var consent = getCookie('cookie_consent');
        if (consent === 'accepted') {
            // Restore original gtag if it existed, or create it
            if (originalGtag) {
                originalGtag.apply(this, arguments);
            } else {
                window.dataLayer = window.dataLayer || [];
                window.dataLayer.push(arguments);
            }
        }
    };

    // Block dataLayer immediately
    window.dataLayer = {
        push: function () {
            var consent = getCookie('cookie_consent');
            if (consent === 'accepted') {
                if (!originalDataLayer) {
                    window.dataLayer = [];
                    window.dataLayer.push.apply(window.dataLayer, arguments);
                } else {
                    originalDataLayer.push.apply(originalDataLayer, arguments);
                }
            }
        }
    };

    // Google Analytics loading function
    function loadGoogleAnalytics() {
        // Double-check consent before loading
        var currentConsent = getConsent();
        if (currentConsent !== 'accepted') {
            return;
        }

        var script = document.createElement('script');
        script.async = true;
        script.src = 'https://www.googletagmanager.com/gtag/js?id=G-XJTPXJ62CE';
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        function gtag() { dataLayer.push(arguments); }
        gtag('js', new Date());
        gtag('config', 'G-XJTPXJ62CE');
    }

    // Block Google Analytics if consent is declined
    function blockGoogleAnalytics() {
        // Prevent gtag from working
        window.gtag = function () { };

        // Prevent dataLayer
        window.dataLayer = {
            push: function () { }
        };

        // Clear any existing GA cookies
        var gaCookies = ['_ga', '_ga_XJTPXJ62CE', '_gid', '_gat', '_gat_gtag_G_XJTPXJ62CE'];
        gaCookies.forEach(function (cookieName) {
            setCookie(cookieName, '', -1);
        });
    }

    // Simple cookie functions
    function setCookie(name, value, days) {
        var expires = '';
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = '; expires=' + date.toUTCString();
        }
        // Try without domain first for iOS compatibility
        document.cookie = name + '=' + value + expires + '; path=/; SameSite=Lax';
    }

    // Simple consent storage using only cookies
    function setConsent(value) {
        setCookie('cookie_consent', value, 365);
    }

    function getConsent() {
        return getCookie('cookie_consent');
    }

    // Function to clear all consent (for testing)
    function clearConsent() {
        setCookie('cookie_consent', '', -1); // Delete cookie

        // Also clear any GA cookies that might exist
        var gaCookies = ['_ga', '_ga_XJTPXJ62CE', '_gid', '_gat', '_gat_gtag_G_XJTPXJ62CE'];
        gaCookies.forEach(function (cookieName) {
            setCookie(cookieName, '', -1);
        });
    }

    // Create and show banner
    function createBanner() {
        var existingBanner = document.getElementById('custom-cookie-banner');
        if (existingBanner) return;

        var banner = document.createElement('div');
        banner.id = 'custom-cookie-banner';
        banner.innerHTML =
            '<div style="' +
            'position: fixed;' +
            'bottom: 0;' +
            'left: 0;' +
            'right: 0;' +
            'background: #000;' +
            'color: white;' +
            'padding: 16px;' +
            'z-index: 10000;' +
            'font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif;' +
            'font-size: 14px;' +
            'line-height: 1.4;' +
            'box-shadow: 0 -2px 10px rgba(0,0,0,0.3);' +
            '">' +
            '<div style="max-width: 1200px; margin: 0 auto; display: flex; align-items: center; flex-wrap: wrap; gap: 12px;">' +
            '<div style="flex: 1; min-width: 200px;">' +
            'This website uses cookies to provide analytics and improve your experience. ' +
            '<a href="/terms/" style="color: #f1d600; text-decoration: underline;">Learn more</a>' +
            '</div>' +
            '<div style="display: flex; gap: 8px; flex-wrap: wrap;">' +
            '<button id="cookie-decline" style="' +
            'background: transparent;' +
            'border: 1px solid #666;' +
            'color: white;' +
            'padding: 8px 16px;' +
            'border-radius: 4px;' +
            'cursor: pointer;' +
            'font-size: 14px;' +
            '">Decline</button>' +
            '<button id="cookie-accept" style="' +
            'background: #f1d600;' +
            'border: none;' +
            'color: black;' +
            'padding: 8px 16px;' +
            'border-radius: 4px;' +
            'cursor: pointer;' +
            'font-size: 14px;' +
            'font-weight: bold;' +
            '">Allow cookies</button>' +
            '</div>' +
            '</div>' +
            '</div>';

        document.body.appendChild(banner);

        // Add click handlers
        document.getElementById('cookie-accept').onclick = function () {
            setConsent('accepted');
            hideBanner();
            loadGoogleAnalytics();
        };

        document.getElementById('cookie-decline').onclick = function () {
            setConsent('declined');
            hideBanner();
            blockGoogleAnalytics();
        };
    }

    function hideBanner() {
        var banner = document.getElementById('custom-cookie-banner');
        if (banner) {
            banner.style.display = 'none';
            // Also remove it completely
            setTimeout(function () {
                if (banner.parentNode) {
                    banner.parentNode.removeChild(banner);
                }
            }, 100);
        }
    }

    // Initialize on page load
    function init() {
        var consent = getConsent();

        if (!consent) {
            // No consent given, show banner
            createBanner();
        } else if (consent === 'accepted') {
            // Consent given, load analytics
            loadGoogleAnalytics();
        } else if (consent === 'declined') {
            // Consent declined, block analytics
            blockGoogleAnalytics();
        }
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();