# Interactive baseball scorecard

[![Demo video](https://thumbs.gfycat.com/DeliciousBasicFennecfox-small.gif)](https://gfycat.com/deliciousbasicfennecfox.gif)

This is an interactive version of the common [baseball score card](http://www.baseballscorecard.com/scoring.htm) used by fans to record and track what happens in a game. It is intended to teach fans how to keep score, to be used for fun in lieu of a paper scorecard, and to practice building complex apps in React and Redux.

A live version of this project can be found at https://stevenhoward.github.io/

## Technical design

The app uses a Redux store (wrapped with redux-undo) to track the home and away team separately. Each team's data consists of a list of Plays and PlayFragments.

A Play represents the result of a plate appearance, and is used for storing the statistics that will be credited to the batter (RBIs, hits).

Each Play contains one or more PlayFragments, which represent the movements of individual runners on the bases. A PlayFragment where the runner advances 0 bases is an out. If a runner's PlayFragments add up to 4, the runner scores.

Plays and PlayFragments are stored in chronological order. A PlayFragment might not correspond to a particular play, e.g. in the case of a stolen base or wild pitch.

The project makes extensive use of selectors to display the data and make calculations for new incoming data.

## Prior art

[Wikipedia](https://en.wikipedia.org/wiki/Baseball_scorekeeping) has a good overview of scorekeeping. Of note is Project Scoresheet, which splits out the data in a slightly different way: events are grouped as either before, during, or after a plate appearance.
