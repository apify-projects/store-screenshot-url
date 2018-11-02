# Actor - Screenshot URL

Actor serving as an example of Input Schema. Takes URL of website and screenshot configuration parameters as input and outputs a screenshot of the website into Key-Value store.

## INPUT

Input of this actor should be JSON containing filter specification. Allowed filters are:

| Field | Type | Description | Allowed values |
| ----- | ---- | ----------- | -------------- |
| url | String | Search term | Any string value |
| waitUntil | String | When should the screenshot be taken | One of:<br>"load"<br>"domcontentloaded"<br>"networkidle2"<br>"networkidle0" |
| delay | Number | Delay before the screenshot is taken after the waitUntil finishes | Minimum: 0, Maximum: 3600000 |
| viewportWidth | Number | How wide should the website and screenshot be | Minimum: 100, Maximum: 3840 |

For more information about `waitUntil` parameter please take a look at documentation of [Puppeteers page.goto function](https://github.com/GoogleChrome/puppeteer/blob/v1.10.0/docs/api.md#pagegotourl-options).

## OUTPUT

Once the actor finishes, it will output a screenshot of the website into a file called OUTPUT
stored in Key-Value store associated with the run.
