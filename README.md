# Actor - Screenshot URL

Actor serving as an example of Input Schema. Takes URL of website and screenshot configuration parameters as input and outputs a screenshot of the website into Key-Value store.

## INPUT

Input of this actor should be JSON containing filter specification. Allowed filters are:

| Field | Type | Description | Allowed values |
| ----- | ---- | ----------- | -------------- |
| url | String | Search term | Any string value |
| waitUntil | String | When should the screenshot be taken | One of:<br>"load"<br>"domcontentloaded"<br>"networkidle2"<br>"networkidle0" |

## OUTPUT

Once the actor finishes, it will output a screenshot of the website into file called OUTPUT.png
stored in Key-Value store.
