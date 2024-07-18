Website Screenshot Generator takes a URL of the website and screenshot configuration parameters as input and outputs a screenshot of the website into the Key-Value store and links it to a Dataset.

> The Website Screenshot Generator is a simple Actor that serves primarily as an example Actor. It can be used for many websites and use cases but for more advanced use cases, prefer using [Website Content Crawler](https://apify.com/apify/website-content-crawler) which can also generate screenshots and supports:
- Sophisticated crawling options
- Adaptive anti-scraping and rendering strategies
- Automatic closing of cookie banners
- Extensive customization options

## Proxy settings
If you are getting blocked or redirected to a login page, consider using RESIDENTIAL proxy type which can often bypass these blocks. You can set it up in the input configuration.

## INPUT

Input of this actor should be JSON containing filter specification. Allowed filters are:

| Field | Type | Description | Allowed values |
| ----- | ---- | ----------- | -------------- |
| url | String | Search term | Any string value |
| waitUntil | String | When should the screenshot be taken | One of:<br>"load"<br>"domcontentloaded"<br>"networkidle2"<br>"networkidle0" |
| delay | Number | Delay before the screenshot is taken after the waitUntil finishes | Minimum: 0, Maximum: 3600000 |
| viewportWidth | Number | How wide should the website and screenshot be | Minimum: 100, Maximum: 3840 |
| scrollToBottom | Boolean | Should the browser scroll to the bottom of the page before taking a screenshot | true/false |
| delayAfterScrolling | Number | Specify the delay (in milliseconds) after scrolling to the bottom of the page before taking the screenshot. This option is only used if 'Wait for Network Idle After Scrolling' is not enabled. | Minimum: 0, Maximum: 3600000 |
| waitUntilNetworkIdleAfterScroll | Boolean | Choose whether to wait for the network to become idle after scrolling to the bottom of the page before taking a screenshot. If enabled, this option overrides the 'Delay After Scrolling' option. | true/false |
| waitUntilNetworkIdleAfterScrollTimeout | Number | Specify the maximum wait time (in milliseconds) for the network to become idle after scrolling to the bottom of the page before taking the screenshot, this option is used to make sure handler doesn't get stuck for some pages. This option is only used if 'Wait for Network Idle After Scrolling' is enabled. | Minimum: 1000, Maximum: 3600000 |

For more information about `waitUntil` parameter please take a look at documentation of [Puppeteers page.goto function](https://github.com/GoogleChrome/puppeteer/blob/v1.10.0/docs/api.md#pagegotourl-options).

## OUTPUT

Once the actor finishes, it will output a screenshot of the website into a file called OUTPUT
stored in Key-Value store associated with the run.


