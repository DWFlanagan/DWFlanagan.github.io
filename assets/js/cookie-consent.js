// Define the Google Analytics loading function
function loadGAonConsent() {
    console.log('Loading Google Analytics after cookie consent');
    // Google Analytics 4 (gtag) implementation
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-XJTPXJ62CE';
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', 'G-XJTPXJ62CE');
    console.log('Google Analytics configured');
}

window.cookieconsent.initialise({
    "palette": {
        "popup": {
            "background": "#000"
        },
        "button": {
            "background": "#f1d600"
        }
    },
    "type": "opt-in",
    "content": {
        "message": "This website uses cookies to provide analytics and improve your experience.",
        "href": "/terms/"
    },
    onInitialise: function (status) {
        console.log('Cookie consent initialized with status:', status);
        var type = this.options.type;
        var didConsent = this.hasConsented();
        console.log('Type:', type, 'Did consent:', didConsent);
        if (type == 'opt-in' && didConsent) {
            // enable cookies
            loadGAonConsent();
        }
        if (type == 'opt-out' && !didConsent) {
            // disable cookies
        }
    },
    onStatusChange: function (status, chosenBefore) {
        console.log('Cookie consent status changed:', status, 'Chosen before:', chosenBefore);
        var type = this.options.type;
        var didConsent = this.hasConsented();
        console.log('Type:', type, 'Did consent:', didConsent);
        if (type == 'opt-in' && didConsent) {
            // enable cookies
            loadGAonConsent();
        }
        if (type == 'opt-out' && !didConsent) {
            // disable cookies
        }
    },
    onRevokeChoice: function () {
        var type = this.options.type;
        if (type == 'opt-in') {
            // disable cookies
        }
        if (type == 'opt-out') {
            // enable cookies
            loadGAonConsent();
        }
    }
});