# IMDB Scraper

__NOTE: Make sure you are on an updated version of either Chrome or Firefox (tested with Chrome 91)__

The scripts within this project will assist in extracting filmmaker information from IMDB.

This project contains two methods:

### Method 1 (manual)
1. Navigate to an `episodes` page, i.e `https://pro.imdb.com/title/tt3007572/episodes`.

2. Copy the script in `console-exporter.js` into the browser console and hit enter. A red link should appear at the top of the web page. 

3. Click on the red link. A download of a csv of the filmmaker info on the page should begin. 

### Method 2 (automated)

--This method is best delt with by someone with at least a little javascript experience--

__Note - this method is mostly given as a starting off point, and I wouldn't call it "production ready" yet, but it should work__

1. Make sure you have Node and NPM installed.

2. In a terminal, run `npm install` to install needed dependencies.

3. In `scraper.mjs`, fill in the email and password for the IMDB Pro account you would like to use. Also add the IMDB show links to the `showPages` array at the top of the script.

4. In the root project folder terminal, run `npm run scrape`. You should see a new browser window pop up, and the login process. NOTE - you might need see a page warning you about multiple users using the same account. Just click on the link "I certify all device logins are mine", complete the little capcha, and hit confirm. You should be redirected to the IMDB home page.

5. CSV files containing filmmaker data should be created for each episode in teh `exports` folder.